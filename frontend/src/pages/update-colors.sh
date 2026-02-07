#!/bin/bash
# Script to replace all old colors with sky blue theme colors
# Run this in the frontend/src/pages directory

# Color replacements
OLD_GRADIENT_1="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
OLD_GRADIENT_2="linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
OLD_GRADIENT_3="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
OLD_GRADIENT_4="linear-gradient(135deg, #4e73df, #36b9cc)"
OLD_GRADIENT_5="linear-gradient(135deg, #1cc88a, #17a076)"
OLD_GRADIENT_6="linear-gradient(135deg, #f6c23e, #f8b63d)"

NEW_PRIMARY="#0ea5e9"
NEW_SECONDARY="#0284c7"
NEW_WHITE="#ffffff"
NEW_BG="#ffffff"
NEW_SKY_LIGHT="#f0f9ff"

# Icon color replacements
OLD_ICON_1="#667eea"
OLD_ICON_2="#3498db"
OLD_ICON_3="#0dcaf0"
OLD_ICON_4="#764ba2"
OLD_ICON_5="#2c3e50"
OLD_ICON_6="#e74c3c"
OLD_ICON_7="#ffc107"
OLD_ICON_8="#28a745"
OLD_ICON_9="#dc3545"
OLD_ICON_10="#0099FF"

# Type replacements - all files
for file in *.js; do
  # Replace gradients with solid colors
  sed -i "s/${OLD_GRADIENT_1}/${NEW_PRIMARY}/g" "$file"
  sed -i "s/${OLD_GRADIENT_2}/${NEW_WHITE}/g" "$file"
  sed -i "s/${OLD_GRADIENT_3}/#ef4444/g" "$file"
  
  # Replace icon colors
  sed -i "s/${OLD_ICON_1}/${NEW_PRIMARY}/g" "$file"
  sed -i "s/${OLD_ICON_2}/${NEW_PRIMARY}/g" "$file"
  sed -i "s/${OLD_ICON_3}/${NEW_PRIMARY}/g" "$file"
  sed -i "s/${OLD_ICON_5}/#1a1a1a/g" "$file"
  sed -i "s/${OLD_ICON_6}/${NEW_PRIMARY}/g" "$file"
  sed -i "s/${OLD_ICON_7}/f59e0b/g" "$file"
  sed -i "s/${OLD_ICON_8}/#10b981/g" "$file"
  sed -i "s/${OLD_ICON_9}/#ef4444/g" "$file"
done

echo "Color theme updates completed!"
