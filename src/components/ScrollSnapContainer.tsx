import { ReactNode } from "react";

interface ScrollSnapContainerProps {
  children: ReactNode;
}

const ScrollSnapContainer = ({ children }: ScrollSnapContainerProps) => {
  return (
    <div className="scroll-snap-container">
      {children}
    </div>
  );
};

export default ScrollSnapContainer;
