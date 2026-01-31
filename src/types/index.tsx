
export type PageHeaderProps = {
	pageTitle: string;
	pageSubtitle?: string;
	actionBtns?: ActionButton[];
};

export type ActionButton = {
	label: string;
	onClick: () => void;
	variant: "default" | "secondary" | "destructive" | "outline";
    size?: "default" | "sm" | "lg" | "icon" | "icon-sm" | "icon-lg" | "xs" | "icon-xs" | null | undefined;

}
