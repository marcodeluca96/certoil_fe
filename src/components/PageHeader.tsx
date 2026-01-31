import type { PageHeaderProps } from "@/types";
import { Button } from "./ui/button";

const PageHeader = (props: PageHeaderProps) => {
	return (
		<div className="page-header">
			<div>
				<h1 className="page-title">{props.pageTitle}</h1>
				{props.pageSubtitle && (
					<p className="page-subtitle">{props.pageSubtitle}</p>
				)}
			</div>
			{props.actionBtns &&
				props.actionBtns.map((btn, index) => (
					<Button
						key={index}
                        variant={"default"}
						size={btn.size || "default"}
						onClick={btn.onClick}
					>
						{btn.label}
					</Button>
				))}
		</div>
	);
};

export default PageHeader;
