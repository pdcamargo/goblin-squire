import Konva from 'konva';
import { ShapeTypes } from '../../../../store/ducks/editor';

export type TextShapeProps = Konva.TextConfig;

export type TextOnChangeEvent = {
  x: number;
  y: number;
  width?: number;
  height?: number;
} & TextShapeProps;

export type TextProps = {
  selectShape: (
    shapeId: string | undefined,
    config: Konva.Text,
    shapeType: ShapeTypes
  ) => void;
  updateShape: (
    shapeId: string | undefined,
    newConfig: Konva.Text,
    shapeType: ShapeTypes
  ) => void;

  deleteShape: (shapeId: string | undefined, shapeType: ShapeTypes) => void;
  isSelected: (shapeId: string | undefined) => boolean;
  shapeProps: TextShapeProps;
};
