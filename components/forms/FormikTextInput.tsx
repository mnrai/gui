import * as React from "react";
// import { graphql, HeadFC, Link, useStaticQuery } from "gatsby";
import { TextInputField, TextInputFieldProps } from "evergreen-ui";
import { FormikConfig, FormikProps } from "formik";


const FormikTextInput: React.FC<TextInputFieldProps &{ formik: FormikProps<any>; name: string}> = (props) => {

  return (
    <TextInputField
      {...props}
      value={props.formik.values[props.name]}
      onChange={(e:any)=>{
        props.formik.setFieldValue(props.name, e.target.value)
      }}
      isInvalid={!!props.formik.errors[props.name]}
      validationMessage={props.formik.errors[props.name]}
    />
  );
};

export { FormikTextInput };
