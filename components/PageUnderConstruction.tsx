import React from "react";
import { Card } from "./ui/card";
import { 
  AlertCircle, 
  Calendar, 
  Clock, 
  Construction, 
  Hammer, 
  HardHat, 
  Lightbulb, 
  MailPlus, 
  MessageCircle, 
  Wrench 
} from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

interface PageUnderConstructionProps {
  title?: string;
  backUrl?: string;
  backLabel?: string;
  description?: string;
  estimatedCompletion?: string;
  contactEmail?: string;
  className?: string;
  showAnimatedElements?: boolean;
}

const PageUnderConstruction = ({
  title = "Page Under Construction",
  backUrl = "/admin",
  backLabel = "Back to Dashboard",
  description = "We're working hard to build this feature for you. This section is currently under development and will be available soon.",
  estimatedCompletion,
  contactEmail = "support@creditsea.com",
  className,
  showAnimatedElements = true,
}: PageUnderConstructionProps) => {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[60vh]", className)}>
      <Card className="w-full max-w-2xl p-8 text-center bg-white shadow-lg relative overflow-hidden">
        {/* Construction pattern background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ 
            backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)",
            backgroundSize: "10px 10px"
          }}></div>
        </div>

        {/* Main content */}
        <div className="relative z-10">
          {/* Icon section */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center">
                <HardHat className="w-12 h-12 text-yellow-600" />
              </div>
              <div className="absolute -top-2 -right-2 bg-blue-100 rounded-full p-2">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              {showAnimatedElements && (
                <div className="absolute -bottom-2 -left-2 bg-green-100 rounded-full p-2 animate-bounce">
                  <Hammer className="w-6 h-6 text-green-600" />
                </div>
              )}
            </div>
          </div>

          {/* Title and description */}
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
          
          <div className="space-y-4 mb-8">
            <p className="text-gray-600">
              {description}
            </p>
            
            {estimatedCompletion && (
              <div className="flex items-center justify-center space-x-2 text-sm text-green-700 bg-green-50 rounded-full py-1 px-4 mx-auto w-fit">
                <Calendar className="w-4 h-4" />
                <span>Estimated completion: {estimatedCompletion}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <Button variant="outline" asChild>
              <Link href={backUrl}>
                {backLabel}
              </Link>
            </Button>

            <Button variant="outline" asChild>
              <Link href={`mailto:${contactEmail}?subject=Inquiry about ${title}`}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Request Info
              </Link>
            </Button>
          </div>

          {/* Features coming soon list */}
          <div className="mt-8">
            <Separator />
            <div className="py-4">
              <h3 className="text-sm font-medium text-gray-500 flex items-center justify-center">
                <Lightbulb className="w-4 h-4 mr-2" />
                Features Coming Soon
              </h3>
              <ul className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <li className="flex items-center text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></div>
                  Detailed reporting
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></div>
                  Data visualization
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></div>
                  Intelligent automation
                </li>
                <li className="flex items-center text-gray-600">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></div>
                  Export capabilities
                </li>
              </ul>
            </div>
            <Separator />
          </div>

          {/* Footer */}
          <div className="mt-6 pt-4">
            <p className="text-xs text-gray-500 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              We value your input! Share suggestions at {contactEmail}
            </p>

            {showAnimatedElements && (
              <div className="mt-4 flex justify-center">
                <div className="px-4 py-1 border border-yellow-300 rounded-md bg-yellow-50 text-yellow-700 text-xs flex items-center">
                  <Construction className="w-3 h-3 mr-1 animate-spin-slow" />
                  <span>Development in progress</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Animated elements in corners */}
        {showAnimatedElements && (
          <>
            <div className="absolute top-0 left-0 w-16 h-16 -translate-x-1/2 -translate-y-1/2 bg-yellow-400/10 rounded-full"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 translate-x-1/3 translate-y-1/3 bg-blue-400/10 rounded-full"></div>
          </>
        )}
      </Card>
    </div>
  );
};

export default PageUnderConstruction;
