import type { PageHeaderProps } from "@/types";
import { Button } from "./ui/button";

const PageHeader = (props: PageHeaderProps) => {
  return (
    <div className="page-header mb-4">
      <div className="w-full header-title">
        <h1 className="page-title">{props.pageTitle}</h1>
        {props.pageSubtitle && <p className="page-subtitle">{props.pageSubtitle}</p>}
      </div>
      <div className="flex gap-2 justify-end w-full header-actions">
        {props.actionBtns &&
          props.actionBtns.map((btn, index) => (
            <Button
              key={index}
              variant={btn.variant || "default"}
              size={btn.size || "default"}
              onClick={btn.onClick}
              disabled={btn.disabled}
            >
              {btn.label}
            </Button>
          ))}
      </div>
    </div>
  );
};

export default PageHeader;
