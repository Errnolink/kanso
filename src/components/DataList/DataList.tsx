// DataList — label/value rows. Lineage: NERV's .psec/.plbl/.pval parameter
// block. Label left in tracked orange, value right in tabular mono, one
// hairline between rows and none at the ends.
import {
  type HTMLAttributes,
  type ReactNode,
  forwardRef,
} from "react";
import type { RampName } from "../../ramp";

export type DataListState = RampName | "info" | "neutral";

export interface DataListItem {
  label: string;
  value: ReactNode;
  state?: DataListState;
}

export interface DataListProps extends Omit<HTMLAttributes<HTMLDListElement>, "color"> {
  items: readonly DataListItem[];
  dense?: boolean;
}

const stateClass: Record<DataListState, string> = {
  nominal: "kanso-datalist__value--nominal",
  caution: "kanso-datalist__value--caution",
  elevated: "kanso-datalist__value--elevated",
  warning: "kanso-datalist__value--warning",
  critical: "kanso-datalist__value--critical",
  info: "kanso-datalist__value--info",
  neutral: "",
};

export const DataList = forwardRef<HTMLDListElement, DataListProps>(function DataList(
  { items, dense = false, className = "", ...rest },
  ref
) {
  return (
    <dl
      ref={ref}
      className={[
        "kanso-datalist",
        dense ? "kanso-datalist--dense" : "",
        className,
      ].join(" ")}
      {...rest}
    >
      {items.map((item) => (
        <div className="kanso-datalist__row" key={item.label}>
          <dt className="kanso-datalist__label">{item.label}</dt>
          <dd
            className={[
              "kanso-datalist__value",
              stateClass[item.state ?? "neutral"],
            ].join(" ")}
          >
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
});
