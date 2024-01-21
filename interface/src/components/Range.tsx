import { Typography } from "@mui/material";
import { useEffect, useState } from "react";

export type TypeVariants = 'body1' | 'body2' | 'caption' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface RangeProps {
  min?: number;
  max?: number;
  step?: number;
  height?: string;
  width?: string;
  defaultValue: number;
  onBlur?: (e:React.FocusEvent<HTMLInputElement>) => void;
  label?: string;
  labelSuffix?: string;
  labelPrefix?: string;
  orientation?: 'horizontal' | 'vertical';
  percentage?: true;
  panDisplay?: true;
  callback?: (value:number) => void;
  labelVariant?: TypeVariants;
  labelColor?: string;
  onChange?: (e:React.ChangeEvent<HTMLInputElement>) => void;
  inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
}

const Range = ({ inputProps = {}, min, max, panDisplay, onChange, step=1, labelVariant, labelColor, labelSuffix = '', labelPrefix = '', percentage, callback, defaultValue, height, width, onBlur, label, orientation }: RangeProps) => {
  const [workingValue, setWorkingValue] = useState(defaultValue);
  const [editing, setEditing] = useState(false);

  // When we stop editing the value, set the value to the working value, if it has changed
  useEffect(() => {
    if (!editing && workingValue !== defaultValue) {
      if (callback) {
        callback(workingValue);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, workingValue, callback]);

  useEffect(() => {
    setWorkingValue(defaultValue);
  }, [defaultValue]);

  const horizontalStyle = {
    height: height,
    width: width || '100%',
  };

  const verticalStyle = {
    height: height || '3.5rem',
    width: width || '2rem',
  };

  const inputStyle = orientation === 'vertical' ? verticalStyle : horizontalStyle;

  let labelText = label;

  if (label || labelPrefix) {
    if (percentage) {
      labelText = `${Math.round(workingValue * 100)}%`;
    } else if (panDisplay) {
      labelText = workingValue > 0 ? `${workingValue}% R` : workingValue < 0 ? `${workingValue * -1}% L` : 'C';
    } else {
      labelText = `${workingValue}${labelSuffix}`;
    }
  }

  return (
    <>
      <input type="range"
        value={workingValue}
        {...{ onBlur, min, max, step, defaultValue, orient: orientation, appearance: `slider-${orientation}` }}
        style={inputStyle}
        aria-orientation={orientation}

        onChange={(e) => {
          const valueToSet = parseFloat(e.target.value);
          setWorkingValue((valueToSet || valueToSet === 0) ? valueToSet : defaultValue);
          onChange?.(e);
        }}
        onMouseDown={() => {
          setEditing(true);
        }}
        onKeyDown={() => {
          setEditing(true);
        }}
        onMouseUp={(e) => {
          const target = e.target as HTMLInputElement;
          const valueToSet = parseFloat(target.value);
          setWorkingValue((valueToSet || valueToSet === 0) ? valueToSet : defaultValue);
          setEditing(false);
        }}
        onKeyUp={(e) => {
          const target = e.target as HTMLInputElement;
          const valueToSet = parseFloat(target.value);
          setWorkingValue((valueToSet || valueToSet === 0) ? valueToSet : defaultValue);
          setEditing(false);
        }}
        {...inputProps}
      />
      {labelText && 
        <Typography variant={labelVariant} color={labelColor} display="block">
          {labelPrefix}
          {labelText}
          {labelSuffix}
        </Typography>
      }
    </>
  );
};

export default Range;