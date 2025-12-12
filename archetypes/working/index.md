---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
year: {{ now.Format "2006" }}
tags: []
featured: true
slug: "{{ .Name | urlize }}"
description: ""
external: true
externalurl: ""
cover: image.png
---
