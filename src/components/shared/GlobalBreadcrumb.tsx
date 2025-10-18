import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrentPage?: boolean;
}

interface GlobalBreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  className?: string;
  showOnMobile?: boolean;
}

const GlobalBreadcrumb: React.FC<GlobalBreadcrumbProps> = ({
  items,
  separator,
  className = "",
  showOnMobile = false,
}) => {
  const mobileClass = showOnMobile ? "" : "hidden md:block";

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLastItem = index === items.length - 1;
          const isLink = !isLastItem && item.href;

          return (
            <React.Fragment key={index}>
              <BreadcrumbItem className={mobileClass}>
                {isLink ? (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                ) : (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>

              {!isLastItem && (
                <BreadcrumbSeparator className={mobileClass}>
                  {separator}
                </BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default GlobalBreadcrumb;
