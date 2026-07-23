import { Link } from "react-router-dom";

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="World location" className="breadcrumbs">
      <ol className="breadcrumbs__list">
        {items.map((item, index) => {
          const isCurrent = index === items.length - 1;
          return (
            <li key={item.path} className="breadcrumbs__item">
              {isCurrent ? (
                <span aria-current="location" title={item.label} className="breadcrumbs__current">
                  {item.label}
                </span>
              ) : (
                <Link to={item.path}>{item.label}</Link>
              )}
              {!isCurrent && (
                <span className="breadcrumbs__separator" aria-hidden="true">
                  ▸
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
