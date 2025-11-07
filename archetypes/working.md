---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
year: {{ now.Format "2006" }}
tags: []
featured: true
slug: "{{ .Name | urlize }}"
description: ""
external: true
external-url: ""
---

## Overview

Brief description of the project.

## Challenge

What problem were you solving?

## Solution

How did you approach it?

## Impact

What were the results?