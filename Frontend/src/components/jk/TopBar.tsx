import { Link } from "@tanstack/react-router";
import { Icon } from "./Icon";

export function TopBar({
  title,
  back,
  right,
  showBrand,
}: {
  title?: string;
  back?: string;
  right?: React.ReactNode;
  showBrand?: boolean;
}) {
  return (
    <header className="sticky top-0 z-40 flex justify-between items-center px-margin-mobile bg-surface-container-lowest border-b border-border-subtle h-[60px]">
      <div className="flex items-center gap-3">
        {back ? (
          <Link to={back} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low">
            <Icon name="arrow_back" className="text-on-surface-variant" />
          </Link>
        ) : null}
        {showBrand ? (
          <h1 className="font-headline-sm-mobile text-headline-sm-mobile font-extrabold text-primary">JalanKita</h1>
        ) : title ? (
          <h1 className="font-headline-sm-mobile text-headline-sm-mobile font-bold text-on-surface">{title}</h1>
        ) : null}
      </div>
      <div className="flex items-center gap-3">{right}</div>
    </header>
  );
}
