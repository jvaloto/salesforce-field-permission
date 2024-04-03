# Salesforce Field Permission

Mass update field permissions for different objects in field sets.

## Overview

If you spent a lot of time setting field permission in permission sets, this extension is for you!

This extension uses [Salesforce CLI](https://github.com/forcedotcom/salesforcedx-vscode) and [JSforce](https://github.com/jsforce/jsforce) to mass update field permissions for different objects in field sets directly in your VS Code using authenticated orgs from salesforce cli.

You can set org and permission sets as default and when you open the page these settings are pre-filled and you can use less clicks (and time :wink:).

## Requirements

 - VS Code
 - Authenticated orgs from Salesforce CLI

## Features

- List all authenticated orgs from salesforce cli
- Select permission set from a list
- Select Object API from a list
- Select Field API as text field
- Select multiple fields filtering by an object
- Select object and fields and let the extension search in what permission set they are been used
- Create/Update permission set for object and fields
- Set org as default for next use
- Set permission set as default for next use

## How to use it

Open Command Pallet and use this command:

`SFP: Open - Salesforce Field Permission`

## Basic usage

Select permission sets, add object and fields and change the permissions

![example.png](https://github.com/jvaloto/salesforce-field-permission/blob/main/media/readme/Screenshot_1.png?raw=true)

## Release Notes

You can view all changes from [CHANGELOG](https://github.com/jvaloto/salesforce-field-permission/blob/main/CHANGELOG.md) file

## Next Ideas

Here is my [TODO list](https://github.com/jvaloto/salesforce-field-permission/issues) with ideas for next releases

## Author

- Jonathan Valoto - [GitHub](https://github.com/jvaloto)