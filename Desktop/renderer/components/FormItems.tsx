import React from 'react';
import TextField from '@material-ui/core/TextField';
import { Autocomplete } from '@material-ui/lab';
import { MFOption, MFOptionCombo } from './InsertFormDialog';

export function ManualAutoComplete<Type>(props: {fieldname: string, value: Type, placeholder: string, options: MFOptionCombo[], handleChange: any, width: string}){
  const { fieldname, value, placeholder, options, handleChange,width } = props;

  return(
      <Autocomplete
          id="combo-box-demo"
          options={options}
          placeholder={placeholder}
          onChange={(event: any, newValue: MFOptionCombo) => {
              handleChange(event, newValue);
          }}
          getOptionLabel={(e) => e.label}
          getOptionSelected={(option, value) => option.id === value.id}
          style={{ width: width }}
          renderInput={(params) => <TextField {...params} label={fieldname} variant="outlined" />}
      />
  )
}
