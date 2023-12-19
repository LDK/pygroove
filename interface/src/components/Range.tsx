import { Typography } from "@mui/material";
import { ActionCreatorWithPayload } from "@reduxjs/toolkit";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface RangeProps {
  min?: number;
  max?: number;
  step?: number;
  height?: string;
  width?: string;
  defaultValue: number;
  updateState?: ActionCreatorWithPayload<number>;
  label?: string;
  labelSuffix?: string;
  labelPrefix?: string;
  orientation?: 'horizontal' | 'vertical';
  percentage?: true;
  callback?: (value:number) => void;
  labelVariant?: 'body1' | 'body2' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  labelColor?: string;
}

const Range = ({ min, max, step=1, labelVariant, labelColor, labelSuffix = '', labelPrefix = '', percentage, callback, defaultValue, height, width, updateState, label, orientation }: RangeProps) => {
  const [workingValue, setWorkingValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);
  const dispatch = useDispatch();

  // When we stop editing the value, set the value to the working value, if it has changed
  useEffect(() => {
    if (!editing && workingValue !== defaultValue) {
      if (updateState) {
        dispatch(updateState(workingValue));
      }
      if (callback) {
        callback(workingValue);
      }
    }
  }, [editing, setEditing, workingValue, defaultValue, dispatch, updateState, callback]);

  const horizontalStyle = {
    height: height,
    width: width || '100%',
  };

  const verticalStyle = {
    height: height || '3.5rem',
    width: width || '2rem',
  };

  const inputStyle = orientation === 'vertical' ? verticalStyle : horizontalStyle;

  return (
    <>
      <input type="range" 
        {...{ min, max, step, defaultValue, orient: orientation, appearance: `slider-${orientation}` }}
        style={inputStyle}
        aria-orientation={orientation}

        onChange={(e) => {
          setWorkingValue(parseFloat(e.target.value) || defaultValue);
        }}
        onMouseDown={() => {
          setEditing(true);
        }}
        onKeyDown={() => {
          setEditing(true);
        }}
        onMouseUp={(e) => {
          const target = e.target as HTMLInputElement;
          setWorkingValue(parseFloat(target.value) || defaultValue);
          setEditing(false);
        }}
        onKeyUp={(e) => {
          const target = e.target as HTMLInputElement;
          setWorkingValue(parseFloat(target.value) || defaultValue);
          setEditing(false);
        }}
      />
      {label && 
        <Typography variant={labelVariant} color={labelColor} display="block">
          {labelPrefix}{label}: {percentage ? `${Math.round(workingValue * 100)}%` : workingValue}{labelSuffix}
        </Typography>
      }
    </>
  );
};

export default Range;