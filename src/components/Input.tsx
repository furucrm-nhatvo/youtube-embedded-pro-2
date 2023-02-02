import React, { useState } from "react";

export default React.forwardRef((props: any, ref: any) => {
  const [value, setValue] = useState(props.value);
  const handleOnChange = (event: any) => {
    if (props.onChange) {
      props.onChange(event);
    }
    setValue(event.target.value);
  };
  return (
    <input
      className={props.className}
      type={props.type}
      name={props.name}
      min={props.min}
      max={props.max}
      value={value}
      onChange={handleOnChange}
      onClick={(e: any) => e.stopPropagation()}
      ref={ref}
      onKeyPress={props.onKeyPress}
    />
  );
});
