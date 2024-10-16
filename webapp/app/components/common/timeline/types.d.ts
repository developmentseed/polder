export interface TimelineDataSuccess {
  date: Date;
  data: {
    value: number;
    min: number;
    max: number;
    valid_percent: number;
  };
  status: 'success';
}

export interface TimelineDataLoading {
  date: Date;
  data: undefined;
  status: 'loading' | 'error';
}

export type TimelineData = TimelineDataSuccess | TimelineDataLoading;
