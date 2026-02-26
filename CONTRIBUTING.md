# How to contribute

## How to add a new settings entry

### Edit `options.html`:

Add another entry:

```html

<div class="setting-group">
	<input id="newSettingName" type="checkbox">
	<label for="newSettingName">Setting description</label>
</div>
```

### Edit `options.js`:

Add a new entry in the `SETTING_KEYS` array

### Optional - add default value in `settings.json`

### Reference the setting in the code:

```javascript
window.deSaffSettings.newSettingName
```

## Add new file

### Add file path to `manifest.json`:

Important! The order of the files matter.
They are loaded by the browser in that order, so if for example `content.js` depends on your new file, the new file will
have to appear first in the list.
