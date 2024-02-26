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
- Add Object API and Field API as text fields
- Select fields from a object
- Create/Update permission set fields
- Set org as default for next use
- Set permission set as default for next use

## How to use it

Open Command Pallet and use this command:

`SFP: Open - Salesforce Field Permission`

## Basic usage

![example_basic.gif](https://github.com/jvaloto/salesforce-field-permission/blob/main/media/readme/example_basic.gif?raw=true)

## Selecting fields from an object

![example_object.gif](https://github.com/jvaloto/salesforce-field-permission/blob/main/media/readme/example_object.gif?raw=true)

## Setting org and permission sets as default

![example_default_value.gif](https://github.com/jvaloto/salesforce-field-permission/blob/main/media/readme/example_default_value.gif?raw=true)

## Release Notes

You can view all changes from [CHANGELOG](https://github.com/jvaloto/salesforce-field-permission/blob/main/CHANGELOG.md) file

## Author

- Jonathan Valoto - [GitHub](https://github.com/jvaloto)