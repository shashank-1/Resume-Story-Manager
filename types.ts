
export interface StarFormat {
  situation: string;
  task: string;
  action: string;
  result: string;
}

export interface MetricData {
  value: string;
  label: string;
}

export interface DeepDiveData {
  bullet: string;
  star: StarFormat;
  metrics: MetricData[];
  questions: string[];
  narrative: string;
}

export enum TabType {
  STAR = 'STAR',
  METRICS = 'METRICS',
  NARRATIVE = 'NARRATIVE'
}
