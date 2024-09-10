import React from "react";
import { InputAdornment, Input, InputLabel } from "@material-ui/core";
import { Search as SearchIcon, Clear as ClearIcon } from "@material-ui/icons";

export function SearchBar(props) {
  const { value, onChange, onCancelSearch, placeholder } = props;

  return (
    <div>
      
      <Input
        style={{width:'100%'}}
        id="search-input"
        value={value}
        onChange={onChange}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        }
        endAdornment={
          value && (
            <InputAdornment position="end" onClick={onCancelSearch} style={{ cursor: "pointer" }}>
              <ClearIcon />
            </InputAdornment>
          )
        }
        placeholder={placeholder}
      />
    </div>
  );
}
