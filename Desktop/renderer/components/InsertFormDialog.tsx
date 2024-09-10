import { Button, Chip, createStyles, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, Input, InputAdornment, InputLabel, makeStyles, MenuItem, OutlinedInput, Select, Snackbar, TextField, Theme, Typography, TypographyVariant, useTheme, FormControlLabel, Radio, RadioGroup } from "@material-ui/core";
import { Alert, Autocomplete } from "@material-ui/lab";
import React from "react";
import DateFnsUtils from '@date-io/date-fns'
import {DatePicker, DateTimePicker, MuiPickersUtilsProvider} from '@material-ui/pickers'
import { Box } from '@material-ui/core';
import Grid from "@material-ui/core/Grid";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
  }),
);

function getStyles(opt: MFOption, fullOpts: MFOption[], theme: Theme) {
    return {
      fontWeight:
        fullOpts.map(e => e.label).indexOf(opt.label) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }



export function FormItemBeforeAfterNumber(props: {index: number, contexttitle: string, contextcaption: string, fieldname: string, unit: string, beforeFieldname: string, beforeValue: number, min: number, max: number, handleChange: any, value: number}){
    const { index, contexttitle, contextcaption, fieldname, unit, beforeFieldname, min, max, handleChange, value, beforeValue } = props;

    return (
        <div>
            <Grid container spacing={2} direction="row">
                <Grid item sm={3} md={3} lg={3} xl={3}>
                    <Grid container spacing={0} direction="column">
                        <Grid item>
                            <Typography variant="body1">
                                {contexttitle}
                            </Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="caption">
                                {contextcaption}
                            </Typography>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel htmlFor={"outlined-adornment-amount-b4-"+index*10}>{beforeFieldname}</InputLabel>
                        <OutlinedInput
                            key={index*10}
                            id={"outlined-adornment-amount-b4-"+index*10}
                            value={beforeValue}
                            disabled
                            inputProps={{
                                min: min,
                                max: max
                            }}
                            type="number"
                            endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
                            label={beforeFieldname}
                        />
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControl fullWidth variant="outlined">
                        <InputLabel htmlFor={"outlined-adornment-amount-"+index}>{fieldname}</InputLabel>
                        <OutlinedInput
                            key={index}
                            id={"outlined-adornment-amount-"+index}
                            defaultValue={value}
                            onChange={e => handleChange(e, index)}
                            inputProps={{
                                min: min,
                                max: max
                            }}
                            type="number"
                            endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
                            label={fieldname}
                        />
                    </FormControl>
                </Grid>
            </Grid>
        </div>
    )
}

export function FormItemNumber(props: {fieldname: string, unit: string, min: number, max: number, handleChange: any, value: number}){
    const { fieldname, unit, min, max, handleChange, value } = props;

    return (
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">{fieldname}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={value}
            onChange={handleChange}
            inputProps={{
                min: min,
                max: max
            }}
            type="number"
            endAdornment={<InputAdornment position="end">{unit}</InputAdornment>}
            label={fieldname}
          />
        </FormControl>
    )
}

export interface MFOption {
    label: string
    value : string
}

export interface MFOptionCombo {
    id: number
    label: string
    content: any
}

export function FormItemCombo<Type>(props: {fieldname: string, value: Type, placeholder: string, options: MFOptionCombo[], handleChange: any}){
    const { fieldname, value, placeholder, options, handleChange } = props;

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
            style={{ width: '100%' }}
            renderInput={(params) => <TextField {...params} label={fieldname} variant="outlined" />}
        />
    )
}
  
export function FormItemMultiCombo<Type extends MFOptionCombo>(props: {
    fieldname: string;
    value: Type[];
    placeholder: string;
    options: MFOptionCombo[];
    handleChange: any;
  }) {
    const { fieldname, value, placeholder, options, handleChange } = props;
  
    return (
      <Autocomplete
        multiple
        id="combo-box-demo"
        options={options}
        getOptionLabel={(e) => e.label}
        value={value}
        onChange={handleChange}
        style={{ width: '100%' }}
        renderInput={(params) => (
          <TextField {...params} label={fieldname} variant="outlined" placeholder={placeholder} />
        )}
      />
    );
  }
  
  
  


export function FormItemSelect<Type>(props: {fieldname: string, value: Type, placeholder: string, options: MFOption[], handleChange: any}){
    const { fieldname, value, placeholder, options, handleChange } = props;

    return(
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="form-item-select">{fieldname}</InputLabel>
            <Select
            labelId="form-item-select"
            id="form-item-select"
            value={value}
            onChange={handleChange}
            label={fieldname}
            placeholder={placeholder}
            >
            {options.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
            </Select>
        </FormControl>
    )
}

export function FormItemRadioButton(props) {
    const { fieldname, value, options, handleChange } = props;
  
    return (
      <FormControl component="fieldset">
        <Typography variant="body1">{fieldname}</Typography>
        <RadioGroup name={fieldname} value={value} onChange={handleChange}>
          {options.map((option) => (
            <FormControlLabel
              key={option.id}
              value={option.id}
              control={<Radio color="primary" />}
              label={option.label}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

export function FormItemDateTime(props: {fieldname: string, min: Date, max: Date, value: Date, handleChange: any}){
    const { fieldname, min, max, handleChange, value } = props;

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            {fieldname}
            <DateTimePicker format="MMMM do, yyyy HH:mm" fullWidth emptyLabel={fieldname} value={value} minDate={min} maxDate={max} onChange={handleChange} />
        </MuiPickersUtilsProvider>
        
    )
}

export function FormItemDate(props: {fieldname: string, min: Date, max: Date, value: Date, handleChange: any}){
    const { fieldname, min, max, handleChange, value } = props;

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            {fieldname}
            <DatePicker format="MMMM do, yyyy" fullWidth emptyLabel={fieldname} value={value} minDate={min} maxDate={max} onChange={handleChange} />
        </MuiPickersUtilsProvider>
        
    )
}

export function FormItemLabel(props: {labeltext: string, variant: TypographyVariant}){
    const { labeltext, variant } = props;

    return (
        <Typography variant={variant}>{labeltext}</Typography>
    )
}

export function FormItemLongText(props: {fieldname: string, value: string, placeholder: string, minLength: number, maxLength: number, handleChange: any}){
    const { fieldname, value, placeholder, minLength, maxLength, handleChange } = props;

    return(
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">{fieldname}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            label={fieldname}
            multiline
            rows={3}
          />
        </FormControl>
    )
}

export function FormItemShortText(props: {fieldname: string, value: string, placeholder: string, minLength: number, maxLength: number, handleChange: any}){
    const { fieldname, value, placeholder, minLength, maxLength, handleChange } = props;

    return(
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">{fieldname}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            label={fieldname}
          />
        </FormControl>
    )
}

export function FormItemPreFilledShortText(props: {fieldname: string, value: string}){
    const { fieldname, value } = props;

    return(
        <FormControl fullWidth variant="outlined">
          <InputLabel htmlFor="outlined-adornment-amount">{fieldname}</InputLabel>
          <OutlinedInput
            id="outlined-adornment-amount"
            value={value}
            onChange={e => {}}
            placeholder={""}
            label={fieldname}
            disabled
          />
        </FormControl>
    )
}

export interface FormItem{
    id: string
    component: any
}

export default function FormDialog(props: {title: string, success_msg: string, positive_btn_label: string, negative_btn_label: string, generic_err: string, fields: FormItem[], handleSubmit: any, handleClose: any, open: boolean, openError: boolean, setOpenError: any}){
    const { title, success_msg, positive_btn_label, negative_btn_label, generic_err, fields, handleSubmit, handleClose, open, openError, setOpenError } = props;

    const [openSnackbar, setOpenSnackbar] = React.useState(false);

    const handleSnackbarClose = () => {
        setOpenSnackbar(false);
    }

    const handleLocalSubmit = () => {
        setOpenSnackbar(true);
        handleSubmit();
    }

    return(
        <React.Fragment>
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                {openError && (
                    <Alert severity="error" onClose={() => {
                        setOpenSnackbar(false)
                        setOpenError(false)}
                    }>{generic_err}</Alert>
                )}
                <DialogTitle>{title}</DialogTitle>
                <DialogContent dividers>
                    {fields.map((field) => (
                        <Box m={'1rem'}>
                            {field.component}
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{negative_btn_label}</Button>
                    <Button color='primary' variant='contained' onClick={handleLocalSubmit}>{positive_btn_label}</Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={openSnackbar && !openError} autoHideDuration={3000} onClose={handleSnackbarClose}>
                <Alert onClose={handleSnackbarClose} severity="success">
                    kontol
                    {success_msg}
                </Alert>
            </Snackbar>
        </React.Fragment>
    )
}