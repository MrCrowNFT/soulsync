import type { ChartData, ChartOptions } from "chart.js";

export type LineData = {
  options: ChartOptions<"line">;
  data: ChartData<"line">;
};

export interface LineProp {
  data: LineData;
}
