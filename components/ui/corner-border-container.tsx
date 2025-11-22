import React from "react";
import { cn } from "@/lib/utils";

export const CornerIcon = ({ className, ...rest }: React.SVGProps<SVGSVGElement>) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className={className}
      {...rest}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
    </svg>
  );
};

export interface CornerBorderContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  cornerClassName?: string;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

export const CornerBorderContainer: React.FC<CornerBorderContainerProps> = ({
  children,
  className,
  cornerClassName,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative border border-gray-800 bg-black/50 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <CornerIcon className={cn("absolute h-6 w-6 -top-3 -left-3 text-gray-500 z-10", cornerClassName)} />
      <CornerIcon className={cn("absolute h-6 w-6 -bottom-3 -left-3 text-gray-500 z-10", cornerClassName)} />
      <CornerIcon className={cn("absolute h-6 w-6 -top-3 -right-3 text-gray-500 z-10", cornerClassName)} />
      <CornerIcon className={cn("absolute h-6 w-6 -bottom-3 -right-3 text-gray-500 z-10", cornerClassName)} />
      {children}
    </div>
  );
};