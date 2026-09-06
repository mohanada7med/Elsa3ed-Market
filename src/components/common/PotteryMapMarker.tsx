import React from 'react';
import {
  HeritageGeometricMarker,
  GeometricMarkerType,
  HeritageGeometricMarkerProps
} from './HeritageGeometricMarker';

export type PotteryMarkerType = GeometricMarkerType | string;

export interface PotteryMapMarkerProps extends Omit<HeritageGeometricMarkerProps, 'type'> {
  type?: PotteryMarkerType;
}

export const PotteryMapMarker: React.FC<PotteryMapMarkerProps> = (props) => {
  return <HeritageGeometricMarker {...props} />;
};
