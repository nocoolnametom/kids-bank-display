import * as React from "react";

export interface IProps {
  kids: string[];
  value: string;
  onChange: (name: string) => void;
}

export const KidSelector = ({ kids, value, onChange }: IProps) => (
  <select onChange={(e) => onChange(e.target.value)} value={value}>
    <option value=""></option>
    {kids.map((kid, i) => (
      <option key={`${kid}_${i}`} value={kid}>
        {kid}
      </option>
    ))}
  </select>
);
