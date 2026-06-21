'use strict';
'require view';
'require dom';
'require rpc';
'require uci';

var callUciGet = rpc.declare({ object: 'uci', method: 'get', params: ['config'], expect: { 'values': {} } });

var SVG = {
	wifi: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
	eye: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
	eyeOff: '<svg viewBox="0 0 24 24"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>',
	save: '<svg viewBox="0 0 24 24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>',
	wifiOff: '<svg viewBox="0 0 24 24"><path d="M22.99 9C19.15 5.16 13.8 3.76 8.84 4.78l2.52 2.52c3.47-.17 6.99 1.05 9.63 3.7l2-2zM18.99 13c-1.29-1.29-2.84-2.13-4.49-2.56l3.53 3.53.96-.97zM2 3.05L5.07 6.1C3.6 6.82 2.22 7.78 1 9l2 2c1.02-1.02 2.17-1.78 3.38-2.32l2.52 2.52C7.46 11.69 6.13 12.48 5 13l2 2c1.05-1.05 2.41-1.73 3.84-2.06l2.22 2.22C11.75 15.69 10.95 16.35 10 17l2 2 1.07-1.07L22.7 27.5l1.41-1.41L3.41 1.64 2 3.05z"/></svg>',
	settings: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z"/></svg>',
	arrow: '<svg viewBox="0 0 24 24"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>',
	trash: '<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>',
	add: '<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function radioLabel(device, wirelessUci) {
	for (var s in wirelessUci) {
		var sec = wirelessUci[s];
		if (sec && sec['.type'] === 'wifi-device' && sec['.name'] === device) {
			var band = sec.band || '';
			var htmode = sec.htmode || '';
			if (band === '2g' || band === '2.4g') return '2.4G WiFi';
			if (band === '5g') return '5G WiFi';
			if (band === '6g') return '6G WiFi';
			if (htmode.indexOf('HE') !== -1 || htmode.indexOf('AX') !== -1) return '5G WiFi';
			var ch = parseInt(sec.channel, 10);
			if (ch > 0 && ch <= 14) return '2.4G WiFi';
			if (ch > 14) return '5G WiFi';
			return device.toUpperCase() + ' WiFi';
		}
	}
	return device ? (device.toUpperCase() + ' WiFi') : 'WiFi';
}

function encLabel(enc) {
	var map = {
		'psk2+ccmp': 'WPA2-PSK', 'psk2': 'WPA2-PSK', 'psk2+aes': 'WPA2-PSK',
		'psk-mixed+ccmp': 'WPA/WPA2-PSK', 'psk-mixed': 'WPA/WPA2-PSK',
		'sae': 'WPA3-SAE', 'sae-mixed': 'WPA2/WPA3',
		'psk+ccmp': 'WPA-PSK', 'psk': 'WPA-PSK',
		'none': 'Open', 'owe': 'OWE'
	};
	return map[enc] || enc || 'None';
}

function modeLabel(mode) {
	var map = { 'ap': 'Access Point', 'sta': 'Client', 'adhoc': 'Ad-Hoc', 'monitor': 'Monitor', 'mesh': 'Mesh' };
	return map[mode] || mode || 'AP';
}

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callUciGet('wireless'), {})
		]);
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	render: function(data) {
		var wirelessUci = data[0] || {};
		var self = this;

		var ifaces = [];
		var devices = {};

		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-device') {
				devices[sec['.name'] || s] = sec;
			}
		}

		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-iface') {
				var devName = sec.device || '';
				var dev = devices[devName] || {};
				ifaces.push({
					section: sec['.name'] || s,
					ssid: sec.ssid || 'Unnamed',
					encryption: sec.encryption || 'none',
					key: sec.key || '',
					disabled: sec.disabled === '1',
					hidden: sec.hidden === '1',
					device: devName,
					mode: sec.mode || 'ap',
					band: radioLabel(devName, wirelessUci),
					htmode: dev.htmode || '-',
					channel: dev.channel || 'auto',
					txpower: dev.txpower || ''
				});
			}
		}

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var activeCount = ifaces.filter(function(i) { return !i.disabled; }).length;

		/* ── Hero ── */
		var hero = el('div', 'tg-hero');
		if (ifaces.length > 0 && activeCount > 0)
			hero.style.background = 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0ea5e9 100%)';
		else if (ifaces.length > 0)
			hero.style.background = 'linear-gradient(135deg, #44403c 0%, #57534e 50%, #78716c 100%)';
		else
			hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var shieldDiv = el('div', 'tg-shield ' + (activeCount > 0 ? 'connected' : 'disconnected'),
			SVG.wifi.replace('<svg ', '<svg style="width:40px;height:40px;fill:#fff" '));
		if (activeCount > 0) {
			shieldDiv.style.background = 'rgba(14,165,233,0.3)';
			shieldDiv.style.boxShadow = '0 0 24px rgba(14,165,233,0.4), 0 0 48px rgba(14,165,233,0.2)';
		}
		hero.appendChild(shieldDiv);

		if (ifaces.length === 0) {
			hero.appendChild(el('div', 'tg-status-text', (window.t||function(k){return k;})('No Wi-Fi Radios')));
			hero.appendChild(el('div', 'tg-status-sub', (window.t||function(k){return k;})('No wireless interfaces detected on this router')));
		} else if (activeCount > 0) {
			var ssids = ifaces.filter(function(i) { return !i.disabled; }).map(function(i) { return i.ssid; });
			hero.appendChild(el('div', 'tg-status-text', (window.t||function(k){return k;})('Wi-Fi Broadcasting')));
			hero.appendChild(el('div', 'tg-status-sub',
				(window.t||function(k,n){return k.replace('%s',n);})( activeCount !== 1 ? '%s networks active' : '%s network active', activeCount) + '  •  ' + ssids.join(', ')
			));
		} else {
			hero.appendChild(el('div', 'tg-status-text', (window.t||function(k){return k;})('Wi-Fi Disabled')));
			hero.appendChild(el('div', 'tg-status-sub', (window.t||function(k){return k;})('All wireless networks are turned off')));
		}

		if (ifaces.length > 0 && activeCount > 0) {
			var bandInfo = el('div', 'tg-stats');
			ifaces.forEach(function(iface) {
				if (iface.disabled) return;
				var stat = el('div', 'tg-stat');
				stat.appendChild(el('div', 'tg-stat-val', iface.band.replace(' WiFi', '')));
				stat.appendChild(el('div', 'tg-stat-label', iface.ssid));
				bandInfo.appendChild(stat);
			});
			hero.appendChild(bandInfo);
		}

		root.appendChild(hero);

		/* ── Empty state ── */
		if (ifaces.length === 0) {
			var emptyCard = el('div', 'tg-config');
			emptyCard.style.textAlign = 'center';
			emptyCard.style.padding = '40px 24px';

			var emptyIconWrap = el('div', '');
			emptyIconWrap.style.cssText = 'width:64px;height:64px;margin:0 auto 16px;border-radius:50%;background:var(--simple-accent-light);display:flex;align-items:center;justify-content:center';
			emptyIconWrap.innerHTML = '<svg viewBox="0 0 24 24" width="32" height="32" fill="var(--simple-accent)"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>';
			emptyCard.appendChild(emptyIconWrap);

			var hasRadios = Object.keys(devices).length > 0;
			if (hasRadios) {
				emptyCard.appendChild(el('div', '', '<div style="font-size:18px;font-weight:700;color:var(--simple-text);margin-bottom:8px">No Wi-Fi Networks</div>'));
				emptyCard.appendChild(el('div', '', '<p style="color:var(--simple-muted);margin:0 0 20px">No wireless networks configured yet. Create one to get started.</p>'));
				var addBtnEmpty = el('button', 'wifi-add-btn');
				addBtnEmpty.innerHTML = SVG.add.replace('<svg ', '<svg style="width:18px;height:18px;fill:currentColor" ') + ' Add Wi-Fi Network';
				addBtnEmpty.addEventListener('click', function() { self.showAddDialog(devices, wirelessUci); });
				emptyCard.appendChild(addBtnEmpty);
			} else {
				emptyCard.appendChild(el('div', '', '<div style="font-size:18px;font-weight:700;color:var(--simple-text);margin-bottom:8px">No Wi-Fi Radios</div>'));
				emptyCard.appendChild(el('div', '', '<p style="color:var(--simple-muted);margin:0 0 20px">No wireless hardware detected on this router.</p>'));
			}

			root.appendChild(emptyCard);
			return root;
		}

		/* ── Radio tabs ── */
		if (ifaces.length > 1) {
			var tabCard = el('div', 'tg-config');
			tabCard.style.padding = '0';

			var tabBar = el('div', 'wifi-radio-tabs-v2');
			var panels = [];

			for (var i = 0; i < ifaces.length; i++) {
				(function(idx) {
					var iface = ifaces[idx];
					var isFirst = idx === 0;

					var tabBtn = el('button', 'wifi-tab-v2' + (isFirst ? ' active' : ''));
					tabBtn.addEventListener('click', function() {
						tabBar.querySelectorAll('.wifi-tab-v2').forEach(function(t) { t.classList.remove('active'); });
						this.classList.add('active');
						panels.forEach(function(p, pi) { p.style.display = pi === idx ? '' : 'none'; });
					});
					var dotSpan = el('span', 'wifi-tab-dot ' + (iface.disabled ? 'off' : 'on'));
					tabBtn.appendChild(dotSpan);
					tabBtn.appendChild(document.createTextNode(iface.band));
					tabBar.appendChild(tabBtn);

					var panel = el('div', '');
					panel.style.display = isFirst ? '' : 'none';
					panel.style.padding = '24px';

					panel.appendChild(self.renderIfacePanel(iface, idx, tabBar));
					panels.push(panel);
				})(i);
			}

			tabCard.appendChild(tabBar);
			panels.forEach(function(p) { tabCard.appendChild(p); });
			root.appendChild(tabCard);
		} else {
			var singleCard = el('div', 'tg-config');
			singleCard.appendChild(el('div', 'tg-config-title', SVG.settings + ' ' + ifaces[0].band));
			singleCard.appendChild(self.renderIfacePanel(ifaces[0], 0, null));
			root.appendChild(singleCard);
		}

		/* ── Save button ── */
		var saveWrap = el('div', '');
		saveWrap.style.cssText = 'text-align:center;padding:8px 0 16px';
		var saveBtn = el('button', 'simple-btn simple-btn-primary');
		saveBtn.style.cssText = 'padding:12px 48px;font-size:15px;display:inline-flex;align-items:center;gap:8px';
		saveBtn.innerHTML = SVG.save.replace('<svg ', '<svg style="width:18px;height:18px;fill:currentColor" ') + ' Save & Apply';
		saveBtn.addEventListener('click', function() { self.doSave(saveBtn); });
		saveWrap.appendChild(saveBtn);
		root.appendChild(saveWrap);

		/* ── Add Network button ── */
		if (Object.keys(devices).length > 0) {
			var addWrap = el('div', '');
			addWrap.style.cssText = 'text-align:center;padding:0 0 24px';
			var addBtn = el('button', 'wifi-add-btn');
			addBtn.innerHTML = SVG.add.replace('<svg ', '<svg style="width:18px;height:18px;fill:currentColor" ') + ' Add Wi-Fi Network';
			addBtn.addEventListener('click', function() { self.showAddDialog(devices, wirelessUci); });
			addWrap.appendChild(addBtn);
			root.appendChild(addWrap);
		}

		return root;
	},

	renderIfacePanel: function(iface, idx, tabBar) {
		var self = this;
		var frag = document.createDocumentFragment();

		/* SSID header with power toggle */
		var header = el('div', '');
		header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--simple-card-border)';

		var ssidArea = el('div', '');
		ssidArea.style.cssText = 'display:flex;align-items:center;gap:10px';
		var statusDot = el('span', 'wifi-tab-dot ' + (iface.disabled ? 'off' : 'on'));
		statusDot.style.cssText = 'width:12px;height:12px';
		ssidArea.appendChild(statusDot);
		ssidArea.appendChild(el('span', '', '<span style="font-size:18px;font-weight:700;color:var(--simple-text)">' + iface.ssid + '</span>'));
		header.appendChild(ssidArea);

		var powerToggle = el('label', 'wifi-power-toggle');
		var powerCb = E('input', {
			'type': 'checkbox',
			'data-uci-section': iface.section,
			'data-uci-option': 'disabled',
			'data-uci-config': 'wireless'
		});
		powerCb.checked = !iface.disabled;
		powerCb.addEventListener('change', function() {
			var on = this.checked;
			statusDot.className = 'wifi-tab-dot ' + (on ? 'on' : 'off');
			if (tabBar) {
				var tabDot = tabBar.querySelectorAll('.wifi-tab-v2')[idx].querySelector('.wifi-tab-dot');
				if (tabDot) tabDot.className = 'wifi-tab-dot ' + (on ? 'on' : 'off');
			}
		});
		powerToggle.appendChild(powerCb);
		powerToggle.appendChild(el('span', 'wifi-power-slider'));
		header.appendChild(powerToggle);
		frag.appendChild(header);

		function fieldRow(label, content) {
			var row = el('div', 'inet-field-row');
			row.appendChild(el('span', 'inet-field-label', label));
			var val = el('div', 'inet-field-value');
			if (typeof content === 'string') val.textContent = content;
			else if (content instanceof Node) val.appendChild(content);
			row.appendChild(val);
			return row;
		}

		/* SSID */
		var ssidInput = E('input', {
			'class': 'tg-server-search',
			'type': 'text',
			'value': iface.ssid,
			'style': 'width:280px;max-width:100%',
			'data-uci-section': iface.section,
			'data-uci-option': 'ssid',
			'data-uci-config': 'wireless'
		});
		frag.appendChild(fieldRow('Wi-Fi Name (SSID)', ssidInput));

		/* Encryption */
		var encChoices = [
			['psk2+ccmp', 'WPA2-PSK (Recommended)'],
			['psk-mixed+ccmp', 'WPA/WPA2-PSK Mixed'],
			['sae', 'WPA3-SAE'],
			['sae-mixed', 'WPA2/WPA3 Mixed'],
			['psk+ccmp', 'WPA-PSK (Legacy)'],
			['none', 'Open (No Password)']
		];
		var encSelect = el('select', 'wgc-select');
		encSelect.setAttribute('data-uci-section', iface.section);
		encSelect.setAttribute('data-uci-option', 'encryption');
		encSelect.setAttribute('data-uci-config', 'wireless');
		encChoices.forEach(function(c) {
			var opt = el('option', null);
			opt.value = c[0];
			opt.textContent = c[1];
			if (c[0] === iface.encryption) opt.selected = true;
			encSelect.appendChild(opt);
		});
		frag.appendChild(fieldRow('Wi-Fi Security', encSelect));

		/* Password */
		if (iface.encryption !== 'none') {
			var pwWrap = el('div', 'wifi-password-wrap');
			var pwInput = E('input', {
				'class': 'tg-server-search',
				'type': 'password',
				'value': iface.key,
				'style': 'width:280px;max-width:100%;padding-right:44px',
				'data-uci-section': iface.section,
				'data-uci-option': 'key',
				'data-uci-config': 'wireless'
			});
			pwWrap.appendChild(pwInput);
			var eyeBtn = el('button', 'wifi-eye-btn');
			eyeBtn.type = 'button';
			eyeBtn.title = 'Show/Hide password';
			eyeBtn.innerHTML = SVG.eye;
			eyeBtn.addEventListener('click', function() {
				var inp = this.parentNode.querySelector('input');
				if (inp.type === 'password') { inp.type = 'text'; this.innerHTML = SVG.eyeOff; }
				else { inp.type = 'password'; this.innerHTML = SVG.eye; }
			});
			pwWrap.appendChild(eyeBtn);
			frag.appendChild(fieldRow('Wi-Fi Key', pwWrap));
		}

		/* Visibility */
		var hiddenSelect = el('select', 'wgc-select');
		hiddenSelect.setAttribute('data-uci-section', iface.section);
		hiddenSelect.setAttribute('data-uci-option', 'hidden');
		hiddenSelect.setAttribute('data-uci-config', 'wireless');
		[['0', 'Visible'], ['1', 'Hidden']].forEach(function(c) {
			var opt = el('option', null);
			opt.value = c[0];
			opt.textContent = c[1];
			if ((iface.hidden ? '1' : '0') === c[0]) opt.selected = true;
			hiddenSelect.appendChild(opt);
		});
		frag.appendChild(fieldRow('SSID Visibility', hiddenSelect));

		/* Read-only fields */
		var modeInput = el('input', 'tg-server-search');
		modeInput.type = 'text'; modeInput.readOnly = true; modeInput.value = modeLabel(iface.mode);
		modeInput.style.cssText = 'width:180px;opacity:0.7;cursor:default';
		frag.appendChild(fieldRow('Wi-Fi Mode', modeInput));

		var bwInput = el('input', 'tg-server-search');
		bwInput.type = 'text'; bwInput.readOnly = true; bwInput.value = iface.htmode || '-';
		bwInput.style.cssText = 'width:120px;opacity:0.7;cursor:default';
		frag.appendChild(fieldRow('Bandwidth', bwInput));

		/* Channel */
		var channelSelect = el('select', 'wgc-select');
		channelSelect.setAttribute('data-uci-section', iface.device);
		channelSelect.setAttribute('data-uci-option', 'channel');
		channelSelect.setAttribute('data-uci-config', 'wireless');
		var channelChoices = [['auto', 'Auto']];
		for (var ch = 1; ch <= 14; ch++) channelChoices.push([String(ch), 'Ch ' + ch]);
		for (var ch2 = 36; ch2 <= 165; ch2 += 4) channelChoices.push([String(ch2), 'Ch ' + ch2]);
		channelChoices.forEach(function(c) {
			var opt = el('option', null);
			opt.value = c[0]; opt.textContent = c[1];
			if (c[0] === iface.channel) opt.selected = true;
			channelSelect.appendChild(opt);
		});
		frag.appendChild(fieldRow('Channel', channelSelect));

		/* TX Power */
		var txSelect = el('select', 'wgc-select');
		txSelect.setAttribute('data-uci-section', iface.device);
		txSelect.setAttribute('data-uci-option', 'txpower');
		txSelect.setAttribute('data-uci-config', 'wireless');
		var txChoices = [['', 'Max']];
		for (var tx = 20; tx >= 1; tx--) txChoices.push([String(tx), tx + ' dBm']);
		txChoices.forEach(function(c) {
			var opt = el('option', null);
			opt.value = c[0]; opt.textContent = c[1];
			if (c[0] === iface.txpower) opt.selected = true;
			txSelect.appendChild(opt);
		});
		frag.appendChild(fieldRow('TX Power', txSelect));

		/* Delete button */
		var delWrap = el('div', '');
		delWrap.style.cssText = 'margin-top:20px;padding-top:16px;border-top:1px solid var(--simple-card-border)';
		var delBtn = el('button', 'inet-disconnect-btn');
		delBtn.innerHTML = SVG.trash.replace('<svg ', '<svg style="width:14px;height:14px;fill:currentColor" ') + ' Remove Network';
		delBtn.addEventListener('click', function() {
			if (!confirm('Remove "' + iface.ssid + '"?\n\nThis will delete this Wi-Fi network. You can create a new one afterwards.'))
				return;
			self.deleteNetwork(iface.section);
		});
		delWrap.appendChild(delBtn);
		frag.appendChild(delWrap);

		return frag;
	},

	deleteNetwork: function(section) {
		var self = this;
		uci.load('wireless').then(function() {
			uci.remove('wireless', section);
			return uci.save();
		}).then(function() {
			return uci.apply();
		}).then(function() {
			self.showToast('Wi-Fi network removed');
			setTimeout(function() { window.location.reload(); }, 2500);
		}).catch(function(e) {
			self.showToast('Error: ' + (e.message || e));
		});
	},

	showAddDialog: function(devices, wirelessUci) {
		var self = this;
		var overlay = el('div', 'mesh-guide-overlay');
		var modal = el('div', 'mesh-guide-modal');
		modal.style.maxWidth = '480px';

		var header = el('div', 'mesh-guide-header');
		header.appendChild(el('div', 'mesh-guide-title',
			SVG.add.replace('<svg ', '<svg style="width:20px;height:20px;fill:currentColor;vertical-align:middle;margin-right:6px" ') +
			'New Wi-Fi Network'));
		var closeBtn = el('button', 'mesh-guide-close', '\u00d7');
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		header.appendChild(closeBtn);
		modal.appendChild(header);

		var body = el('div', '');
		body.style.padding = '24px';

		function addField(label, input) {
			var row = el('div', '');
			row.style.cssText = 'margin-bottom:16px';
			var lbl = el('label', '');
			lbl.style.cssText = 'display:block;font-size:13px;font-weight:600;color:var(--simple-text);margin-bottom:6px';
			lbl.textContent = label;
			row.appendChild(lbl);
			row.appendChild(input);
			return row;
		}

		/* Radio selector */
		var radioSelect = el('select', 'wgc-select');
		radioSelect.style.width = '100%';
		var devKeys = Object.keys(devices);
		devKeys.forEach(function(dname) {
			var opt = el('option');
			opt.value = dname;
			opt.textContent = radioLabel(dname, wirelessUci) + ' (' + dname + ')';
			radioSelect.appendChild(opt);
		});
		if (devKeys.length > 1) {
			body.appendChild(addField('Radio', radioSelect));
		}

		/* SSID */
		var ssidInput = el('input', 'tg-server-search');
		ssidInput.type = 'text';
		ssidInput.placeholder = 'e.g. MyNetwork';
		ssidInput.style.cssText = 'width:100%;box-sizing:border-box';
		body.appendChild(addField('Network Name (SSID)', ssidInput));

		/* Encryption */
		var encSelect = el('select', 'wgc-select');
		encSelect.style.width = '100%';
		[
			['psk2+ccmp', 'WPA2-PSK (Recommended)'],
			['psk-mixed+ccmp', 'WPA/WPA2-PSK Mixed'],
			['sae', 'WPA3-SAE'],
			['sae-mixed', 'WPA2/WPA3 Mixed'],
			['none', 'Open (No Password)']
		].forEach(function(c) {
			var opt = el('option');
			opt.value = c[0]; opt.textContent = c[1];
			encSelect.appendChild(opt);
		});
		body.appendChild(addField('Security', encSelect));

		/* Password */
		var pwRow = addField('Password', document.createDocumentFragment());
		var pwWrap = el('div', 'wifi-password-wrap');
		var pwInput = el('input', 'tg-server-search');
		pwInput.type = 'password';
		pwInput.placeholder = 'Minimum 8 characters';
		pwInput.style.cssText = 'width:100%;box-sizing:border-box;padding-right:44px';
		pwWrap.appendChild(pwInput);
		var eyeBtn = el('button', 'wifi-eye-btn');
		eyeBtn.type = 'button';
		eyeBtn.innerHTML = SVG.eye;
		eyeBtn.addEventListener('click', function() {
			if (pwInput.type === 'password') { pwInput.type = 'text'; this.innerHTML = SVG.eyeOff; }
			else { pwInput.type = 'password'; this.innerHTML = SVG.eye; }
		});
		pwWrap.appendChild(eyeBtn);
		pwRow.querySelector('label').parentNode.appendChild(pwWrap);
		body.appendChild(pwRow);

		encSelect.addEventListener('change', function() {
			pwRow.style.display = this.value === 'none' ? 'none' : '';
		});

		modal.appendChild(body);

		/* Actions */
		var actions = el('div', 'dev-dialog-actions');
		var cancelBtn = el('button', 'inet-cancel-btn', 'Cancel');
		cancelBtn.addEventListener('click', function() { overlay.remove(); });
		var createBtn = el('button', 'tg-power-btn', 'Create Network');
		createBtn.style.cssText = 'padding:10px 28px';
		createBtn.addEventListener('click', function() {
			var ssid = ssidInput.value.trim();
			if (!ssid) { self.showToast('Please enter a network name'); return; }
			var enc = encSelect.value;
			var key = pwInput.value;
			if (enc !== 'none' && key.length < 8) {
				self.showToast('Password must be at least 8 characters');
				return;
			}
			var radio = radioSelect.value || devKeys[0];
			overlay.remove();
			self.addNetwork(radio, ssid, enc, enc === 'none' ? '' : key);
		});

		var row = el('div', 'dev-dialog-actions-row');
		row.style.justifyContent = 'flex-end';
		row.appendChild(cancelBtn);
		row.appendChild(createBtn);
		actions.appendChild(row);
		modal.appendChild(actions);

		overlay.appendChild(modal);
		overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);
		ssidInput.focus();
	},

	addNetwork: function(radio, ssid, encryption, key) {
		var self = this;
		var esc = function(s) { return s.replace(/'/g, "'\\''"); };
		var keyArg = key ? "uci set wireless.$SID.key='" + esc(key) + "'; " : '';
		var cmd = 'N=0; while uci -q get wireless.wifinet$N >/dev/null 2>&1; do N=$((N+1)); done; ' +
			'SID=wifinet$N; ' +
			"uci set wireless.$SID=wifi-iface; " +
			"uci set wireless.$SID.device='" + radio + "'; " +
			"uci set wireless.$SID.mode='ap'; " +
			"uci set wireless.$SID.ssid='" + esc(ssid) + "'; " +
			"uci set wireless.$SID.encryption='" + encryption + "'; " +
			keyArg +
			"uci set wireless.$SID.network='lan'; " +
			"uci set wireless.$SID.disabled='0'; " +
			'uci commit wireless; wifi reload; echo WIFI_OK';
		L.resolveDefault(rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] })('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var out = (res && res.stdout) || '';
			if (out.indexOf('WIFI_OK') !== -1) {
				self.showToast('Wi-Fi network "' + ssid + '" created');
				setTimeout(function() { window.location.reload(); }, 3000);
			} else {
				self.showToast('Error creating network');
			}
		});
	},

	doSave: function(btn) {
		var self = this;
		var inputs = document.querySelectorAll('[data-uci-section][data-uci-option]');
		var setOps = [];

		inputs.forEach(function(inp) {
			var section = inp.getAttribute('data-uci-section');
			var option = inp.getAttribute('data-uci-option');
			var config = inp.getAttribute('data-uci-config') || 'wireless';
			if (!section || !option) return;
			if (inp.readOnly) return;

			var val;
			if (inp.type === 'checkbox') {
				val = inp.checked ? '0' : '1';
			} else {
				val = inp.value;
			}
			setOps.push([config, section, option, val]);
		});

		if (setOps.length === 0) {
			self.showToast('No changes detected');
			return Promise.resolve();
		}

		if (btn) {
			btn.disabled = true;
			btn.textContent = 'Saving...';
		}

		var p = Promise.resolve();
		setOps.forEach(function(op) {
			p = p.then(function() { return uci.set(op[0], op[1], op[2], op[3]); });
		});

		return p.then(function() {
			return uci.save();
		}).then(function() {
			return uci.apply();
		}).then(function() {
			if (btn) {
				btn.textContent = '\u2713 Saved';
				btn.style.background = '#22c55e';
			}
			self.showToast('Wi-Fi settings saved successfully!');
			setTimeout(function() { window.location.reload(); }, 2500);
		}).catch(function(e) {
			if (btn) {
				btn.textContent = 'Save Failed';
				btn.style.background = '#ef4444';
				btn.disabled = false;
			}
			self.showToast('Error saving: ' + (e.message || e));
		});
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
