// API error handling utilities for CreditSea

export class ApiError extends Error {
	statusCode: number;

	constructor(message: string, statusCode: number) {
		super(message);
		this.name = "ApiError";
		this.statusCode = statusCode;

		// Ensure instanceof works correctly in TypeScript
		Object.setPrototypeOf(this, ApiError.prototype);
	}
}

/**
 * Handles API responses and throws standardized errors
 * @param response Fetch response object
 * @param customErrorMessage Optional custom error message
 */
export async function handleApiResponse<T>(
	response: Response,
	customErrorMessage = "An error occurred"
): Promise<T> {
	if (!response.ok) {
		// Try to get error details from response
		let errorMessage = customErrorMessage;
		let statusCode = response.status;
		let errorData: any = null;

		try {
			// Clone the response before reading it as JSON to avoid stream already read errors
			const clonedResponse = response.clone();
			errorData = await clonedResponse.json();
			errorMessage =
				errorData.error || errorData.message || customErrorMessage;
		} catch (e) {
			// If parsing fails, use status text or default message
			errorMessage =
				response.statusText ||
				`${customErrorMessage} (${response.status})`;
		}

		// Map some common HTTP status codes to more specific messages
		switch (response.status) {
			case 404:
				errorMessage = errorMessage || "Resource not found";
				break;
			case 401:
				errorMessage =
					errorMessage ||
					"You must be logged in to access this resource";
				break;
			case 403:
				errorMessage =
					errorMessage ||
					"You don't have permission to access this resource";
				break;
			case 429:
				errorMessage =
					errorMessage ||
					"Rate limit exceeded. Please try again later";
				break;
			case 500:
			case 502:
			case 503:
			case 504:
				errorMessage =
					errorMessage ||
					"Server error occurred. Please try again later";
				break;
		}

		// Create ApiError instance
		const apiError = new ApiError(errorMessage, statusCode);

		// Log the error with context
		import("./error-logger")
			.then(({ logError, LogLevel }) => {
				// Determine severity based on status code
				const level =
					statusCode >= 500 ? LogLevel.CRITICAL : LogLevel.ERROR;

				// Create context with request details
				logError(apiError, {
					url: response.url,
					method: response.type,
					status: statusCode,
					errorData,
				});
			})
			.catch(() => {
				// Fallback to console if logger import fails
				console.error(`API Error (${statusCode}):`, errorMessage, {
					url: response.url,
				});
			});

		throw apiError;
	}

	try {
		return (await response.json()) as T;
	} catch (error) {
		console.error("Error parsing response JSON:", error);
		throw new ApiError("Invalid response format from server", 500);
	}
}

/**
 * Creates a user-friendly error message based on HTTP status code
 * @param error Error object (preferably ApiError)
 */
export function getFriendlyErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		// Handle specific status codes
		switch (error.statusCode) {
			case 401:
				return "Please log in to continue";
			case 403:
				return "You don't have permission to access this resource";
			case 404:
				return "The requested resource was not found";
			case 429:
				return "Too many requests, please try again later";
			case 500:
			case 502:
			case 503:
			case 504:
				return "Server error. Our team has been notified";
			default:
				return error.message;
		}
	}

	// Generic error handling
	if (error instanceof Error) {
		if (error.message.includes("fetch")) {
			return "Network connection issue. Please check your internet connection";
		}
		return error.message;
	}

	return "An unexpected error occurred";
}

/**
 * Wraps an API call with standardized error handling
 * @param apiCall The API call function to execute
 * @param errorHandler Optional custom error handler
 * @param options Additional configuration options
 */
export async function withErrorHandling<T>(
	apiCall: () => Promise<T>,
	errorHandler?: (error: unknown) => void,
	options?: {
		silent?: boolean; // If true, errors won't be logged to console
		retry?: boolean; // If true, will retry the API call once on failure
		retryDelay?: number; // Delay in ms before retry
	}
): Promise<{ data: T | null; error: string | null }> {
	const opts = {
		silent: false,
		retry: false,
		retryDelay: 1000,
		...options,
	};

	let retryAttempt = 0;

	const attemptCall = async (): Promise<{
		data: T | null;
		error: string | null;
	}> => {
		try {
			const data = await apiCall();
			return { data, error: null };
		} catch (err) {
			// If we should retry and this is the first attempt
			if (opts.retry && retryAttempt === 0) {
				retryAttempt++;

				// Wait for the specified delay
				await new Promise((resolve) =>
					setTimeout(resolve, opts.retryDelay)
				);

				// Try again
				return attemptCall();
			}
			const errorMessage = getFriendlyErrorMessage(err);

			// Call custom error handler if provided
			if (errorHandler) {
				errorHandler(err);
			}

			// Import and use the error logger
			// Using dynamic import to avoid circular dependencies
			import("./error-logger")
				.then(({ logError, LogLevel }) => {
					// Create context object with relevant information
					const context: Record<string, any> = {
						isRetry: retryAttempt > 0,
					};

					// For API errors, add status code to context
					if (err instanceof ApiError) {
						context.statusCode = err.statusCode;
					}

					// Log with appropriate severity
					const level =
						err instanceof ApiError && err.statusCode >= 500
							? LogLevel.CRITICAL
							: LogLevel.ERROR;

					logError(err, context);
				})
				.catch(() => {
					// Fallback to console if logger import fails
					if (!opts.silent) {
						console.error("API Error:", err);

						// Add additional debug info for ApiErrors
						if (err instanceof ApiError) {
							console.debug(
								`Status code: ${err.statusCode}, Message: ${err.message}`
							);
						}
					}
				});

			return { data: null, error: errorMessage };
		}
	};

	return attemptCall();
}
