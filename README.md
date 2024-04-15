# Salesforce Field Permission

Mass update permissions for different metadata on custom permission sets.

## Overview

If you spent a lot of time setting permissions on permission sets, this extension is for you!

This extension uses [Salesforce CLI](https://github.com/forcedotcom/salesforcedx-vscode) and [JSforce](https://github.com/jsforce/jsforce) to mass update different fields, objects and apex class permissions on permission sets directly in your VS Code using authenticated orgs from Salesforce CLI.

You can set org and permission sets as default and when you open the page these settings are pre-filled and you can use less clicks (and time :wink:).

## Requirements

 - VS Code
 - Authenticated orgs from Salesforce CLI

## Features

- List all authenticated orgs from Salesforce CLI
- Select permission set from a list
- Select Object API from a list
- Select Field API as text field
- Select multiple fields filtering by an object
- Select the metadata and let the extension search in what permission set they are been used
- Create/Update permission set for fields
- Create/Update permission set for objects
- Create/Update permission set for apex class
- Set org as default for next use
- Set permission set as default for next use

## How to use it

Open Command Pallet and use this command:

`SFP: Open - Salesforce Field Permission`

## Basic usage

Select permission sets, add fields, objects and apex classes and change the permissions!

### Fields

![fields.png](https://github.com/jvaloto/salesforce-field-permission/blob/main/media/readme/print_fields.png?raw=true)

### Objects

![objects.png](https://github.com/jvaloto/salesforce-field-permission/blob/main/media/readme/print_objects.png?raw=true)

### Apex Class

![apexClass.png](https://github.com/jvaloto/salesforce-field-permission/blob/main/media/readme/print_apex_class.png?raw=true)

## Release Notes

You can view all changes from [CHANGELOG](https://github.com/jvaloto/salesforce-field-permission/blob/main/CHANGELOG.md) file

## Next Ideas

Here is my [TODO list](https://github.com/jvaloto/salesforce-field-permission/issues) with ideas for next releases

## Issues

Found a bug?
Please let me know by reporting issues on [GitHub issues.](https://github.com/jvaloto/salesforce-field-permission/issues)

## Author

- Jonathan Valoto - [GitHub](https://github.com/jvaloto)