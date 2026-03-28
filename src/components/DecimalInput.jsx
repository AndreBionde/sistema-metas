import { useEffect, useState } from "react";

const sanitizeDecimalInput = (value) => {
  const normalizedValue = String(value ?? "").replace(",", ".");
  let sanitizedValue = "";
  let hasSeparator = false;

  for (const character of normalizedValue) {
    if (character >= "0" && character <= "9") {
      sanitizedValue += character;
      continue;
    }

    if (character === "." && !hasSeparator) {
      sanitizedValue += character;
      hasSeparator = true;
    }
  }

  return sanitizedValue;
};

const buildDraftValue = (value, preserveZero = false) => {
  if (value === "" || value === null || value === undefined) {
    return "";
  }

  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  if (numericValue === 0 && !preserveZero) {
    return "";
  }

  return String(value);
};

const normalizeCommittedValue = (value, preserveZero = false) => {
  const sanitizedValue = sanitizeDecimalInput(value);

  if (!sanitizedValue || sanitizedValue === ".") {
    return preserveZero ? "0" : "";
  }

  const normalizedNumber = Number(sanitizedValue);

  if (!Number.isFinite(normalizedNumber)) {
    return preserveZero ? "0" : "";
  }

  if (normalizedNumber === 0 && !preserveZero) {
    return "";
  }

  return String(normalizedNumber);
};

const DecimalInput = ({
  value,
  onCommit,
  preserveZero = false,
  onBlur,
  onFocus,
  onKeyDown,
  ...inputProps
}) => {
  const [draftValue, setDraftValue] = useState(() =>
    buildDraftValue(value, preserveZero)
  );
  const [isFocused, setIsFocused] = useState(false);

  const externalValue = buildDraftValue(value, preserveZero);

  useEffect(() => {
    if (!isFocused) {
      setDraftValue(externalValue);
    }
  }, [externalValue, isFocused]);

  const commitValue = () => {
    const normalizedValue = normalizeCommittedValue(draftValue, preserveZero);
    setDraftValue(normalizedValue);
    onCommit(normalizedValue);
  };

  return (
    <input
      {...inputProps}
      type="text"
      inputMode="decimal"
      value={draftValue}
      onFocus={(event) => {
        setIsFocused(true);
        onFocus?.(event);
      }}
      onChange={(event) => {
        setDraftValue(sanitizeDecimalInput(event.target.value));
      }}
      onBlur={(event) => {
        setIsFocused(false);
        commitValue();
        onBlur?.(event);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.currentTarget.blur();
        }

        onKeyDown?.(event);
      }}
    />
  );
};

export default DecimalInput;
