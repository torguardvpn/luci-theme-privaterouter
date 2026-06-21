'use strict';
'require view';
'require dom';
'require poll';
'require rpc';
'require uci';
'require network';

var callNetIfStatus = rpc.declare({ object: 'network.interface', method: 'dump', expect: { 'interface': [] } });
var callUciGet = rpc.declare({ object: 'uci', method: 'get', params: ['config'], expect: { 'values': {} } });
var callIwinfoScan = rpc.declare({ object: 'iwinfo', method: 'scan', params: ['device'] });

var SVG = {
	globe: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>',
	ethernet: '<svg viewBox="0 0 24 24"><path d="M7.77 6.76L6.23 5.48.82 12l5.41 6.52 1.54-1.28L3.42 12l4.35-5.24zM7 13h2v-2H7v2zm10-2h-2v2h2v-2zm-6 2h2v-2h-2v2zm6.77-7.52l-1.54 1.28L20.58 12l-4.35 5.24 1.54 1.28L23.18 12l-5.41-6.52z"/></svg>',
	usb: '<svg viewBox="0 0 24 24"><path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.21.99 2.2 2.2 2.2 1.21 0 2.2-.99 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/></svg>',
	cellTower: '<svg viewBox="0 0 24 24"><path d="M7.3 14.7l1.2-1.2c-1-1-1.5-2.3-1.5-3.5s.5-2.5 1.5-3.5L7.3 5.3C6 6.6 5.3 8.3 5.3 10s.7 3.4 2 4.7zM19.1 2.9l-1.2 1.2c1.6 1.6 2.4 3.8 2.4 5.9s-.8 4.3-2.4 5.9l1.2 1.2c2-2 3-4.5 3-7.1s-1-5.1-3-7.1zM16.7 5.3l-1.2 1.2c1 1 1.5 2.3 1.5 3.5s-.5 2.5-1.5 3.5l1.2 1.2c1.3-1.3 2-3 2-4.7s-.7-3.4-2-4.7zM4.9 2.9c-2 2-3 4.5-3 7.1s1 5.1 3 7.1l1.2-1.2C4.5 14.3 3.7 12.1 3.7 10s.8-4.3 2.4-5.9L4.9 2.9zM12 10c0-1.1-.9-2-2-2s-2 .9-2 2c0 .7.4 1.4 1 1.7V22h2V11.7c.6-.3 1-1 1-1.7z"/></svg>',
	wifi: '<svg viewBox="0 0 24 24"><path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/></svg>',
	gear: '<svg viewBox="0 0 24 24"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>',
	info: '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>',
	lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
	eye: '<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>',
	speed: '<svg viewBox="0 0 24 24"><path d="M20.38 8.57l-1.23 1.85a8 8 0 0 1-.22 7.58H5.07A8 8 0 0 1 15.58 6.85l1.85-1.23A10 10 0 0 0 3.35 19a2 2 0 0 0 1.72 1h13.85a2 2 0 0 0 1.74-1 10 10 0 0 0-.27-10.44zm-9.79 6.84a2 2 0 0 0 2.83 0l5.66-8.49-8.49 5.66a2 2 0 0 0 0 2.83z"/></svg>',
	arrowDown: '<svg viewBox="0 0 24 24"><path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/></svg>',
	arrowUp: '<svg viewBox="0 0 24 24"><path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/></svg>'
};

function el(tag, cls, children) {
	if (arguments.length === 1 && typeof tag === 'string' && tag.charAt(0) === '<') {
		var w = document.createElement('span');
		w.innerHTML = tag;
		return w.firstChild;
	}
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (Array.isArray(children)) children.forEach(function(c) { if (c) e.appendChild(c); });
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function formatBytes(b) {
	if (!b || b === 0) return '0 B';
	if (b < 1024) return b + ' B';
	if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
	if (b < 1073741824) return (b / 1048576).toFixed(1) + ' MB';
	return (b / 1073741824).toFixed(2) + ' GB';
}

function formatUptime(s) {
	if (!s) return '-';
	var d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
	if (d > 0) return d + 'd ' + h + 'h ' + m + 'm';
	if (h > 0) return h + 'h ' + m + 'm';
	return m + 'm';
}

return view.extend({
	load: function() {
		return Promise.all([
			L.resolveDefault(callNetIfStatus(), []),
			L.resolveDefault(callUciGet('network'), {}),
			L.resolveDefault(callUciGet('wireless'), {}),
			L.resolveDefault(
				rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] })(
					'/bin/sh', ['-c',
						'for dev in /sys/class/net/*/statistics/rx_bytes; do ' +
						'd=$(echo "$dev" | cut -d/ -f5); ' +
						'rx=$(cat "$dev" 2>/dev/null); ' +
						'tx=$(cat "/sys/class/net/$d/statistics/tx_bytes" 2>/dev/null); ' +
						'echo "$d $rx $tx"; done'
					]), {})
		]);
	},

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	findIface: function(ifaces, name) {
		for (var i = 0; i < ifaces.length; i++)
			if (ifaces[i]['interface'] === name) return ifaces[i];
		return null;
	},

	makeInfoRow: function(label, value, accent) {
		var row = el('div', 'inet-info-row');
		row.appendChild(el('span', 'inet-info-label', label));
		var val = el('span', 'inet-info-val' + (accent ? ' accent' : ''), value);
		row.appendChild(val);
		return row;
	},

	makeCard: function(icon, title, statusDot, badge) {
		var card = el('div', 'tg-config inet-card');
		var hdr = el('div', 'inet-card-header');
		var left = el('div', 'inet-card-left');
		if (statusDot !== undefined) {
			var dot = el('span', 'inet-dot ' + (statusDot ? 'on' : 'off'));
			left.appendChild(dot);
		}
		var iconWrap = el('span', 'inet-card-icon', icon);
		left.appendChild(iconWrap);
		left.appendChild(el('span', 'inet-card-title', title));
		hdr.appendChild(left);
		if (badge) hdr.appendChild(badge);
		card.appendChild(hdr);
		return card;
	},

	renderEthernet: function(wan, wanUci, ifaces) {
		var isUp = wan ? (wan.up || false) : false;
		var wanBadge = el('span', 'inet-badge-pill ' + (isUp ? 'online' : 'offline'), isUp ? 'Connected' : 'Disconnected');
		var card = this.makeCard(SVG.ethernet, 'Ethernet (WAN)', isUp, wanBadge);

		var body = el('div', 'inet-card-body');

		if (wan) {
			var proto = wan.proto || 'dhcp';
			var ip4 = (wan['ipv4-address'] && wan['ipv4-address'].length) ? wan['ipv4-address'][0].address : '-';
			var gw = '-';
			if (wan.route) {
				for (var r = 0; r < wan.route.length; r++) {
					if (wan.route[r].nexthop && wan.route[r].nexthop !== '0.0.0.0') {
						gw = wan.route[r].nexthop;
						break;
					}
				}
			}
			var dns = (wan['dns-server'] && wan['dns-server'].length) ? wan['dns-server'].join(', ') : '-';

			body.appendChild(this.makeInfoRow('Protocol', proto.toUpperCase(), true));
			body.appendChild(this.makeInfoRow('IP Address', ip4));
			body.appendChild(this.makeInfoRow('Gateway', gw));
			body.appendChild(this.makeInfoRow('DNS', dns));
			if (wan.uptime) body.appendChild(this.makeInfoRow('Uptime', formatUptime(wan.uptime)));

			if (wan.data) {
				var traffic = el('div', 'inet-traffic-row');
				var dl = el('div', 'inet-traffic-stat');
				dl.innerHTML = SVG.arrowDown.replace('<svg ', '<svg class="inet-traffic-icon dl" ');
				dl.appendChild(el('span', '', formatBytes(wan.data.rx_bytes || 0)));
				traffic.appendChild(dl);
				var ul = el('div', 'inet-traffic-stat');
				ul.innerHTML = SVG.arrowUp.replace('<svg ', '<svg class="inet-traffic-icon ul" ');
				ul.appendChild(el('span', '', formatBytes(wan.data.tx_bytes || 0)));
				traffic.appendChild(ul);
				body.appendChild(traffic);
			}
		} else {
			var empty = el('div', 'inet-empty-msg');
			empty.innerHTML = SVG.info.replace('<svg ', '<svg style="width:18px;height:18px;fill:var(--simple-muted);flex-shrink:0" ');
			empty.appendChild(el('span', '', 'No WAN connection detected. Check your ethernet cable.'));
			body.appendChild(empty);
		}

		card.appendChild(body);

		var actions = el('div', 'inet-card-actions');
		var modBtn = el('button', 'inet-action-btn');
		modBtn.innerHTML = SVG.gear.replace('<svg ', '<svg style="width:15px;height:15px;fill:currentColor" ');
		modBtn.appendChild(document.createTextNode(' Configure'));
		actions.appendChild(modBtn);
		card.appendChild(actions);

		var editPanel = this.buildEditPanel(wanUci);
		card.appendChild(editPanel);

		modBtn.addEventListener('click', function() {
			editPanel.classList.toggle('open');
		});

		return card;
	},

	buildEditPanel: function(wanUci) {
		var editPanel = el('div', 'inet-edit-panel');
		var editInner = el('div', 'inet-edit-inner');
		editInner.appendChild(el('div', 'inet-edit-title', 'WAN Configuration'));

		var currentProto = (wanUci && wanUci.proto) ? wanUci.proto : 'dhcp';
		var protoTabs = el('div', 'inet-proto-tabs');
		var protos = [['dhcp', 'DHCP'], ['static', 'Static IP'], ['pppoe', 'PPPoE']];
		var protoFields = el('div', 'inet-proto-fields');
		var self = this;
		var selectedProto = currentProto;

		function buildFields(proto) {
			protoFields.innerHTML = '';
			if (proto === 'dhcp') {
				var note = el('div', 'inet-info-note');
				note.innerHTML = SVG.info.replace('<svg ', '<svg style="width:16px;height:16px;fill:var(--simple-accent);flex-shrink:0" ');
				note.appendChild(el('span', '', 'IP address will be assigned automatically by the upstream router or modem.'));
				protoFields.appendChild(note);
			} else if (proto === 'static') {
				var fields = [
					['IP Address', 'ipaddr', wanUci ? wanUci.ipaddr || '' : ''],
					['Netmask', 'netmask', wanUci ? wanUci.netmask || '255.255.255.0' : '255.255.255.0'],
					['Gateway', 'gateway', wanUci ? wanUci.gateway || '' : ''],
					['DNS 1', 'dns1', wanUci && wanUci.dns ? (Array.isArray(wanUci.dns) ? wanUci.dns[0] : wanUci.dns) : ''],
					['DNS 2', 'dns2', wanUci && wanUci.dns && Array.isArray(wanUci.dns) && wanUci.dns[1] ? wanUci.dns[1] : '']
				];
				fields.forEach(function(f) {
					var row = el('div', 'inet-form-row');
					row.appendChild(el('label', 'inet-form-label', f[0]));
					var inp = E('input', { 'class': 'tg-server-search', 'type': 'text', 'placeholder': f[0], 'value': f[2], 'data-field': f[1] });
					row.appendChild(inp);
					protoFields.appendChild(row);
				});
			} else if (proto === 'pppoe') {
				var fields = [
					['Username', 'username', wanUci ? wanUci.username || '' : ''],
					['Password', 'password', wanUci ? wanUci.password || '' : '']
				];
				fields.forEach(function(f) {
					var row = el('div', 'inet-form-row');
					row.appendChild(el('label', 'inet-form-label', f[0]));
					var type = f[1] === 'password' ? 'password' : 'text';
					var inp = E('input', { 'class': 'tg-server-search', 'type': type, 'placeholder': f[0], 'value': f[2], 'data-field': f[1] });
					row.appendChild(inp);
					protoFields.appendChild(row);
				});
			}
		}

		protos.forEach(function(p) {
			var tab = el('button', 'inet-proto-tab' + (p[0] === currentProto ? ' active' : ''), p[1]);
			tab.addEventListener('click', function() {
				protoTabs.querySelectorAll('.inet-proto-tab').forEach(function(t) { t.classList.remove('active'); });
				this.classList.add('active');
				selectedProto = p[0];
				buildFields(p[0]);
			});
			protoTabs.appendChild(tab);
		});

		editInner.appendChild(protoTabs);
		buildFields(currentProto);
		editInner.appendChild(protoFields);

		var btns = el('div', 'inet-edit-actions');
		var cancelBtn = el('button', 'inet-cancel-btn', 'Cancel');
		cancelBtn.addEventListener('click', function() { editPanel.classList.remove('open'); });
		var applyBtn = el('button', 'tg-power-btn', 'Apply Changes');
		applyBtn.style.width = 'auto';
		applyBtn.style.padding = '10px 28px';
		applyBtn.addEventListener('click', function() {
			var wanSection = (wanUci && wanUci['.name']) ? wanUci['.name'] : 'wan';
			uci.set('network', wanSection, 'proto', selectedProto);

			if (selectedProto === 'static') {
				var pf = protoFields;
				['ipaddr', 'netmask', 'gateway'].forEach(function(f) {
					var v = pf.querySelector('[data-field="' + f + '"]');
					if (v && v.value) uci.set('network', wanSection, f, v.value);
				});
				var d1 = pf.querySelector('[data-field="dns1"]');
				var d2 = pf.querySelector('[data-field="dns2"]');
				var dnsArr = [];
				if (d1 && d1.value) dnsArr.push(d1.value);
				if (d2 && d2.value) dnsArr.push(d2.value);
				if (dnsArr.length) uci.set('network', wanSection, 'dns', dnsArr);
			} else if (selectedProto === 'pppoe') {
				['username', 'password'].forEach(function(f) {
					var v = protoFields.querySelector('[data-field="' + f + '"]');
					if (v) uci.set('network', wanSection, f, v.value);
				});
			}

			uci.save().then(function() { return uci.apply(); }).then(function() {
				self.showToast('WAN settings applied successfully!');
				setTimeout(function() { window.location.reload(); }, 2500);
			}).catch(function(e) {
				self.showToast('Error: ' + (e.message || e));
			});
		});
		btns.appendChild(cancelBtn);
		btns.appendChild(applyBtn);
		editInner.appendChild(btns);

		editPanel.appendChild(editInner);
		return editPanel;
	},

	renderTethering: function(ifaces, networkUci) {
		var tetheringIfaces = [];
		for (var s in networkUci) {
			var sec = networkUci[s];
			if (!sec || sec['.type'] !== 'interface') continue;
			var name = sec['.name'] || s;
			if (name === 'wan' || name === 'wan6' || name === 'loopback' || name === 'lan') continue;
			var dev = sec.device || sec.ifname || '';
			if (dev.match(/^usb|^eth[2-9]|^enp.*u/i) || sec.proto === 'dhcp' && dev.match(/eth[2-9]/)) {
				var runtime = this.findIface(ifaces, name);
				tetheringIfaces.push({ uci: sec, runtime: runtime, name: name, device: dev });
			}
		}
		if (tetheringIfaces.length === 0) return null;

		var anyUp = tetheringIfaces.some(function(t) { return t.runtime && t.runtime.up; });
		var badge = el('span', 'inet-badge-pill ' + (anyUp ? 'online' : 'offline'), anyUp ? 'Active' : 'Inactive');
		var card = this.makeCard(SVG.usb, 'USB Tethering', anyUp, badge);
		var body = el('div', 'inet-card-body');

		for (var i = 0; i < tetheringIfaces.length; i++) {
			var ti = tetheringIfaces[i];
			body.appendChild(this.makeInfoRow('Device', ti.device || '-'));
			if (ti.runtime && ti.runtime.up) {
				var ip = (ti.runtime['ipv4-address'] && ti.runtime['ipv4-address'].length) ? ti.runtime['ipv4-address'][0].address : '-';
				body.appendChild(this.makeInfoRow('Status', 'Connected', true));
				body.appendChild(this.makeInfoRow('IP Address', ip));
			} else {
				body.appendChild(this.makeInfoRow('Status', 'Disconnected'));
			}
			if (i < tetheringIfaces.length - 1) {
				body.appendChild(el('div', 'inet-divider'));
			}
		}

		var hint = el('div', 'inet-hint');
		hint.innerHTML = SVG.info.replace('<svg ', '<svg style="width:14px;height:14px;fill:var(--simple-muted);flex-shrink:0" ');
		hint.appendChild(el('span', '', 'Connect a USB-tethered phone for internet access. Advanced tethering options are available in Advanced mode.'));
		body.appendChild(hint);

		card.appendChild(body);
		return card;
	},

	renderCellular: function(ifaces, networkUci) {
		var cellIfaces = [];
		for (var s in networkUci) {
			var sec = networkUci[s];
			if (!sec || sec['.type'] !== 'interface') continue;
			var proto = sec.proto || '';
			if (['qmi', 'mbim', 'ncm', '3g', 'modemmanager'].indexOf(proto) !== -1) {
				var name = sec['.name'] || s;
				var runtime = this.findIface(ifaces, name);
				cellIfaces.push({ uci: sec, runtime: runtime, name: name });
			}
		}
		if (cellIfaces.length === 0) return null;

		var anyUp = cellIfaces.some(function(c) { return c.runtime && c.runtime.up; });
		var badge = el('span', 'inet-badge-pill ' + (anyUp ? 'online' : 'warn'), anyUp ? 'Connected' : 'No SIM');
		var card = this.makeCard(SVG.cellTower, 'Cellular / SIM', anyUp, badge);

		if (!anyUp) {
			var alert = el('div', 'inet-alert');
			alert.innerHTML = SVG.warning.replace('<svg ', '<svg style="width:18px;height:18px;fill:#f59e0b;flex-shrink:0" ');
			alert.appendChild(el('span', '', 'SIM card not detected. Ensure the card is inserted correctly and contacts are clean.'));
			card.appendChild(alert);
		}

		var body = el('div', 'inet-card-body');
		for (var i = 0; i < cellIfaces.length; i++) {
			var ci = cellIfaces[i];
			body.appendChild(this.makeInfoRow('Modem', ci.uci.device || '-'));
			body.appendChild(this.makeInfoRow('Protocol', (ci.uci.proto || '-').toUpperCase(), true));
			body.appendChild(this.makeInfoRow('APN', ci.uci.apn || ci.uci.pdptype || '-'));
			if (ci.runtime && ci.runtime.up) {
				var ip = (ci.runtime['ipv4-address'] && ci.runtime['ipv4-address'].length) ? ci.runtime['ipv4-address'][0].address : '-';
				body.appendChild(this.makeInfoRow('IP Address', ip));
			}
		}

		var hint = el('div', 'inet-hint');
		hint.innerHTML = SVG.gear.replace('<svg ', '<svg style="width:14px;height:14px;fill:var(--simple-muted);flex-shrink:0" ');
		hint.appendChild(el('span', '', 'Detailed modem and APN configuration is available in Advanced mode.'));
		body.appendChild(hint);

		card.appendChild(body);
		return card;
	},

	getRadioBandLabel: function(wirelessUci, radioName) {
		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-device' && (sec['.name'] === radioName || s === radioName)) {
				var band = sec.band || '';
				var hwmode = sec.hwmode || '';
				if (band === '2g' || hwmode === '11g' || hwmode === '11b') return '2.4GHz';
				if (band === '5g' || hwmode === '11a') return '5GHz';
				if (band === '6g') return '6GHz';
				return radioName;
			}
		}
		return radioName;
	},

	getRadios: function(wirelessUci) {
		var radios = [];
		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-device') {
				radios.push(sec['.name'] || s);
			}
		}
		return radios;
	},

	getStaIfaces: function(wirelessUci) {
		var stas = [];
		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-iface' && sec.mode === 'sta') {
				stas.push(sec);
			}
		}
		return stas;
	},

	getRadiosWithSta: function(wirelessUci) {
		var used = {};
		for (var s in wirelessUci) {
			var sec = wirelessUci[s];
			if (sec && sec['.type'] === 'wifi-iface' && sec.mode === 'sta') {
				used[sec.device] = true;
			}
		}
		return used;
	},

	renderWlanCard: function(staIface, ifaces, wirelessUci) {
		var self = this;
		var radioDevice = staIface.device;
		var bandLabel = this.getRadioBandLabel(wirelessUci, radioDevice);
		var isDisabled = staIface.disabled === '1';
		var staNet = staIface.network || 'wwan';
		var staRuntime = this.findIface(ifaces, staNet);
		var staUp = !isDisabled && staRuntime ? (staRuntime.up || false) : false;

		var statusText = staUp ? (staIface.ssid || 'Connected') : isDisabled ? 'Disabled' : 'Disconnected';
		var statusClass = staUp ? 'online' : 'offline';
		var badge = el('span', 'inet-badge-pill ' + statusClass, statusText);
		var cardTitle = 'Wi-Fi Repeater (' + bandLabel + ')';
		var card = this.makeCard(SVG.wifi, cardTitle, staUp, badge);
		var body = el('div', 'inet-card-body');

		body.appendChild(this.makeInfoRow('Radio', radioDevice + ' \u2022 ' + bandLabel));

		if (staUp) {
			body.appendChild(this.makeInfoRow('Network', staIface.ssid || '-'));
			if (staRuntime) {
				var ip = (staRuntime['ipv4-address'] && staRuntime['ipv4-address'].length) ? staRuntime['ipv4-address'][0].address : '-';
				body.appendChild(this.makeInfoRow('IP Address', ip));
			}
			body.appendChild(this.makeInfoRow('Security', staIface.encryption || '-'));

			var dcActions = el('div', 'inet-card-actions');
			var dcBtn = el('button', 'inet-disconnect-btn');
			dcBtn.innerHTML = SVG.wifi.replace('<svg ', '<svg style="width:15px;height:15px;fill:currentColor" ') + ' Disconnect';
			dcBtn.addEventListener('click', (function(si) {
				return function() {
					if (!confirm('Disconnect from "' + (si.ssid || 'this network') + '"?\n\nYou can reconnect by scanning for networks below.'))
						return;
					self.disconnectWifi(si);
				};
			})(staIface));
			dcActions.appendChild(dcBtn);
			body.appendChild(dcActions);
		} else if (isDisabled) {
			body.appendChild(this.makeInfoRow('Network', staIface.ssid || '-'));
			var enableActions = el('div', 'inet-card-actions');
			var enableBtn = el('button', 'tg-power-btn');
			enableBtn.style.cssText = 'width:auto;padding:8px 20px;font-size:13px';
			enableBtn.textContent = 'Reconnect';
			enableBtn.addEventListener('click', (function(si) {
				return function() {
					var cmd = "uci set wireless." + si['.name'] + ".disabled='0'; uci commit wireless; wifi reload; echo OK";
					L.resolveDefault(rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] })('/bin/sh', ['-c', cmd]), {}).then(function() {
						self.showToast('Reconnecting to "' + (si.ssid || 'network') + '"...');
						setTimeout(function() { window.location.reload(); }, 4000);
					});
				};
			})(staIface));
			enableActions.appendChild(enableBtn);

			var removeBtn = el('button', 'inet-disconnect-btn');
			removeBtn.style.cssText = 'margin-left:8px';
			removeBtn.textContent = 'Remove';
			removeBtn.addEventListener('click', (function(si) {
				return function() {
					if (!confirm('Remove saved repeater connection to "' + (si.ssid || 'network') + '"?')) return;
					var cmd = "uci delete wireless." + si['.name'] + "; uci commit wireless; wifi reload; echo OK";
					L.resolveDefault(rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] })('/bin/sh', ['-c', cmd]), {}).then(function() {
						self.showToast('Repeater removed');
						setTimeout(function() { window.location.reload(); }, 3000);
					});
				};
			})(staIface));
			enableActions.appendChild(removeBtn);
			body.appendChild(enableActions);
		} else {
			body.appendChild(this.makeInfoRow('Network', staIface.ssid || '-'));
			var empty = el('div', 'inet-empty-msg');
			empty.innerHTML = SVG.wifi.replace('<svg ', '<svg style="width:18px;height:18px;fill:var(--simple-muted);flex-shrink:0" ');
			empty.appendChild(el('span', '', 'Not connected. The upstream network may be out of range.'));
			body.appendChild(empty);
		}

		card.appendChild(body);

		if (!isDisabled) {
			var scanSection = this.buildScanSection(radioDevice);
			card.appendChild(scanSection);
		}

		return card;
	},

	buildScanSection: function(radioDevice) {
		var self = this;
		var scanSection = el('div', 'inet-scan-section');
		var scanHdr = el('div', 'inet-scan-header');
		scanHdr.appendChild(el('span', 'inet-scan-title', 'Available Networks'));

		var scanBtn = el('button', 'inet-scan-btn-v2');
		scanBtn.innerHTML = SVG.refresh.replace('<svg ', '<svg style="width:14px;height:14px;fill:currentColor" ') + ' Scan';
		scanHdr.appendChild(scanBtn);
		scanSection.appendChild(scanHdr);

		var scanList = el('div', 'inet-wifi-list-v2');
		scanList.appendChild(el('div', 'inet-wifi-placeholder', 'Press Scan to discover nearby Wi-Fi networks'));
		scanSection.appendChild(scanList);

		var connectForm = el('div', 'inet-connect-form');
		connectForm.style.display = 'none';
		scanSection.appendChild(connectForm);

		scanBtn.addEventListener('click', function() {
			scanList.innerHTML = '';
			var spinner = el('div', 'inet-wifi-placeholder');
			spinner.innerHTML = '<span class="inet-spinner"></span> Scanning for networks...';
			scanList.appendChild(spinner);
			scanBtn.disabled = true;
			scanBtn.style.opacity = '0.6';

			L.resolveDefault(callIwinfoScan(radioDevice), { results: [] }).then(function(res) {
				scanBtn.disabled = false;
				scanBtn.style.opacity = '1';
				var results = res.results || res || [];
				if (!Array.isArray(results)) results = [];

				scanList.innerHTML = '';
				if (results.length === 0) {
					scanList.appendChild(el('div', 'inet-wifi-placeholder', 'No networks found. Try scanning again.'));
					return;
				}

				results.sort(function(a, b) { return (b.signal || -100) - (a.signal || -100); });
				var seen = {};
				results.forEach(function(net) {
					var ssid = net.ssid || '';
					if (!ssid || seen[ssid]) return;
					seen[ssid] = true;
					var enc = net.encryption || {};
					var isSecure = enc.enabled !== false && enc.enabled !== undefined;
					var signal = net.signal || -100;
					var quality = Math.min(100, Math.max(0, signal + 110));
					var bars = quality > 75 ? 4 : quality > 50 ? 3 : quality > 25 ? 2 : 1;

					var item = el('div', 'inet-wifi-item-v2');
					var sigIcon = el('div', 'inet-wifi-sig');
					sigIcon.innerHTML = SVG.wifi.replace('<svg ', '<svg style="width:20px;height:20px;fill:' + (bars >= 3 ? 'var(--simple-success)' : bars >= 2 ? 'var(--simple-warning)' : 'var(--simple-danger)') + '" ');
					item.appendChild(sigIcon);

					var info = el('div', 'inet-wifi-info-v2');
					info.appendChild(el('div', 'inet-wifi-ssid-v2', ssid));
					var encName = 'Open';
					if (enc.description) encName = enc.description;
					else if (isSecure) encName = 'Encrypted';
					info.appendChild(el('div', 'inet-wifi-meta-v2', quality + '%  \u00b7  ' + encName));
					item.appendChild(info);

					if (isSecure) {
						var lockWrap = el('span', 'inet-wifi-lock-v2');
						lockWrap.innerHTML = SVG.lock.replace('<svg ', '<svg style="width:14px;height:14px;fill:var(--simple-muted)" ');
						item.appendChild(lockWrap);
					}

					item.addEventListener('click', function() {
						scanList.querySelectorAll('.inet-wifi-item-v2').forEach(function(el) { el.classList.remove('selected'); });
						item.classList.add('selected');
						connectForm.innerHTML = '';
						connectForm.style.display = 'block';

						if (isSecure) {
							var pwRow = el('div', 'inet-form-row');
							pwRow.appendChild(el('label', 'inet-form-label', 'Password'));
							var pwWrap = el('div', 'inet-pw-wrap');
							var pwInput = E('input', { 'class': 'tg-server-search', 'type': 'password', 'placeholder': 'Enter Wi-Fi password', 'id': 'wlan-connect-pw-' + radioDevice });
							pwWrap.appendChild(pwInput);
							var eyeBtn = el('button', 'inet-eye-btn');
							eyeBtn.innerHTML = SVG.eye.replace('<svg ', '<svg style="width:18px;height:18px;fill:var(--simple-muted)" ');
							eyeBtn.addEventListener('click', function() {
								pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
							});
							pwWrap.appendChild(eyeBtn);
							pwRow.appendChild(pwWrap);
							connectForm.appendChild(pwRow);
						}

						var connBtns = el('div', 'inet-edit-actions');
						var connBtn = el('button', 'tg-power-btn');
						connBtn.textContent = 'Connect';
						connBtn.style.width = 'auto';
						connBtn.style.padding = '10px 32px';
						connBtn.addEventListener('click', function() {
							self.connectToWifi(ssid, isSecure, enc, radioDevice);
						});
						connBtns.appendChild(connBtn);
						connectForm.appendChild(connBtns);
					});

					scanList.appendChild(item);
				});
			}).catch(function() {
				scanBtn.disabled = false;
				scanBtn.style.opacity = '1';
				scanList.innerHTML = '';
				scanList.appendChild(el('div', 'inet-wifi-placeholder error', 'Scan failed. Wi-Fi radio may not be available.'));
			});
		});

		return scanSection;
	},

	renderAddConnection: function(wirelessUci, networkUci) {
		var self = this;
		var radios = this.getRadios(wirelessUci);
		var usedRadios = this.getRadiosWithSta(wirelessUci);

		var availableRadios = [];
		for (var i = 0; i < radios.length; i++) {
			if (!usedRadios[radios[i]]) {
				availableRadios.push(radios[i]);
			}
		}

		var hasUsb = false, hasCellular = false;
		for (var s in networkUci) {
			var sec = networkUci[s];
			if (!sec || sec['.type'] !== 'interface') continue;
			var dev = sec.device || sec.ifname || '';
			var proto = sec.proto || '';
			if (dev.match(/^usb|^eth[2-9]|^enp.*u/i)) hasUsb = true;
			if (['qmi', 'mbim', 'ncm', '3g', 'modemmanager'].indexOf(proto) !== -1) hasCellular = true;
		}

		if (availableRadios.length === 0 && hasUsb && hasCellular) return null;

		var addSection = el('div', 'tg-config inet-card');
		addSection.style.cssText = 'text-align:center;padding:20px';

		var addBtn = el('button', 'tg-power-btn');
		addBtn.style.cssText = 'width:auto;padding:10px 24px;font-size:13px;margin:0 auto';
		addBtn.innerHTML = '<span style="font-size:16px;margin-right:6px">+</span> Add Connection';

		addBtn.addEventListener('click', function() {
			var overlay = el('div', 'dapps-modal-overlay');
			var modal = el('div', 'dapps-modal');
			modal.style.maxWidth = '480px';

			var hdr = el('div', 'dapps-modal-hdr');
			hdr.innerHTML = SVG.globe.replace('<svg ', '<svg style="width:22px;height:22px;fill:var(--simple-accent)" ');
			hdr.appendChild(el('span', 'dapps-modal-title', 'Add Connection'));
			var closeBtn = el('button', 'dapps-modal-close');
			closeBtn.innerHTML = '&times;';
			closeBtn.style.cssText = 'background:none;border:none;color:var(--simple-text);font-size:22px;cursor:pointer';
			closeBtn.addEventListener('click', function() { overlay.remove(); });
			hdr.appendChild(closeBtn);
			modal.appendChild(hdr);

			var list = el('div', '');
			list.style.padding = '8px 0';

			for (var i = 0; i < availableRadios.length; i++) {
				(function(radio) {
					var bandLabel = self.getRadioBandLabel(wirelessUci, radio);
					var item = el('div', 'inet-wifi-item-v2');
					item.style.cursor = 'pointer';
					var iconWrap = el('div', 'inet-wifi-sig');
					iconWrap.innerHTML = SVG.wifi.replace('<svg ', '<svg style="width:22px;height:22px;fill:var(--simple-accent)" ');
					item.appendChild(iconWrap);
					var info = el('div', 'inet-wifi-info-v2');
					info.appendChild(el('div', 'inet-wifi-ssid-v2', 'Wi-Fi Repeater (' + bandLabel + ')'));
					info.appendChild(el('div', 'inet-wifi-meta-v2', 'Connect to an upstream Wi-Fi network via ' + radio));
					item.appendChild(info);
					item.addEventListener('click', function() {
						overlay.remove();
						self.showNewRepeaterFlow(radio, bandLabel);
					});
					list.appendChild(item);
				})(availableRadios[i]);
			}

			if (!hasUsb) {
				var usbItem = el('div', 'inet-wifi-item-v2');
				usbItem.style.cursor = 'pointer';
				var usbIcon = el('div', 'inet-wifi-sig');
				usbIcon.innerHTML = SVG.usb.replace('<svg ', '<svg style="width:22px;height:22px;fill:var(--simple-accent)" ');
				usbItem.appendChild(usbIcon);
				var usbInfo = el('div', 'inet-wifi-info-v2');
				usbInfo.appendChild(el('div', 'inet-wifi-ssid-v2', 'USB Tethering'));
				usbInfo.appendChild(el('div', 'inet-wifi-meta-v2', 'Share internet from a phone connected via USB'));
				usbItem.appendChild(usbInfo);
				usbItem.addEventListener('click', function() {
					overlay.remove();
					self.showToast('Connect your phone via USB and enable USB tethering. The connection will appear automatically.');
				});
				list.appendChild(usbItem);
			}

			if (!hasCellular) {
				var cellItem = el('div', 'inet-wifi-item-v2');
				cellItem.style.cursor = 'pointer';
				var cellIcon = el('div', 'inet-wifi-sig');
				cellIcon.innerHTML = SVG.cellTower.replace('<svg ', '<svg style="width:22px;height:22px;fill:var(--simple-accent)" ');
				cellItem.appendChild(cellIcon);
				var cellInfo = el('div', 'inet-wifi-info-v2');
				cellInfo.appendChild(el('div', 'inet-wifi-ssid-v2', 'Cellular / 4G LTE'));
				cellInfo.appendChild(el('div', 'inet-wifi-meta-v2', 'Connect via SIM card or USB LTE modem'));
				cellItem.appendChild(cellInfo);
				cellItem.addEventListener('click', function() {
					overlay.remove();
					self.showCellularSetup();
				});
				list.appendChild(cellItem);
			}

			if (list.children.length === 0) {
				list.appendChild(el('div', 'inet-wifi-placeholder', 'All available connection types are already configured.'));
			}

			modal.appendChild(list);
			overlay.appendChild(modal);
			overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
			document.body.appendChild(overlay);
		});

		addSection.appendChild(addBtn);
		return addSection;
	},

	showNewRepeaterFlow: function(radioDevice, bandLabel) {
		var self = this;
		var card = el('div', 'tg-config inet-card');
		var badge = el('span', 'inet-badge-pill offline', 'New');
		var hdr = el('div', 'inet-card-header');
		var left = el('div', 'inet-card-left');
		left.appendChild(el('span', 'inet-card-icon', SVG.wifi));
		left.appendChild(el('span', 'inet-card-title', 'Wi-Fi Repeater (' + bandLabel + ')'));
		hdr.appendChild(left);
		hdr.appendChild(badge);
		card.appendChild(hdr);

		var scanSection = this.buildScanSection(radioDevice);
		card.appendChild(scanSection);

		var addSection = document.querySelector('.inet-add-connection');
		if (addSection) {
			addSection.parentNode.insertBefore(card, addSection);
			var scanBtnNew = card.querySelector('.inet-scan-btn-v2');
			if (scanBtnNew) scanBtnNew.click();
		} else {
			var root = document.querySelector('.simple-page');
			if (root) {
				root.appendChild(card);
				var scanBtnNew = card.querySelector('.inet-scan-btn-v2');
				if (scanBtnNew) scanBtnNew.click();
			}
		}
	},

	showCellularSetup: function() {
		var self = this;
		var overlay = el('div', 'dapps-modal-overlay');
		var modal = el('div', 'dapps-modal');
		modal.style.maxWidth = '500px';

		var hdr = el('div', 'dapps-modal-hdr');
		hdr.innerHTML = SVG.cellTower.replace('<svg ', '<svg style="width:22px;height:22px;fill:var(--simple-accent)" ');
		hdr.appendChild(el('span', 'dapps-modal-title', 'Cellular / 4G LTE Setup'));
		var closeBtn = el('button', 'dapps-modal-close');
		closeBtn.innerHTML = '&times;';
		closeBtn.style.cssText = 'background:none;border:none;color:var(--simple-text);font-size:22px;cursor:pointer';
		closeBtn.addEventListener('click', function() { overlay.remove(); });
		hdr.appendChild(closeBtn);
		modal.appendChild(hdr);

		var body = el('div', '');
		body.style.padding = '16px 20px';

		var protoPicker = el('div', 'inet-proto-tabs');
		var protocols = [['qmi', 'QMI'], ['mbim', 'MBIM'], ['ncm', 'NCM'], ['3g', '3G/PPP']];
		var selectedProto = 'qmi';
		protocols.forEach(function(p) {
			var tab = el('button', 'inet-proto-tab' + (p[0] === selectedProto ? ' active' : ''), p[1]);
			tab.addEventListener('click', function() {
				protoPicker.querySelectorAll('.inet-proto-tab').forEach(function(t) { t.classList.remove('active'); });
				this.classList.add('active');
				selectedProto = p[0];
			});
			protoPicker.appendChild(tab);
		});
		body.appendChild(protoPicker);

		var fields = [
			['Modem Device', 'device', '/dev/cdc-wdm0', 'e.g. /dev/cdc-wdm0 or /dev/ttyUSB0'],
			['APN', 'apn', 'internet', 'Your carrier APN'],
			['PIN Code', 'pincode', '', 'SIM PIN (leave blank if none)']
		];
		fields.forEach(function(f) {
			var row = el('div', 'inet-form-row');
			row.style.marginTop = '12px';
			row.appendChild(el('label', 'inet-form-label', f[0]));
			var inp = document.createElement('input');
			inp.className = 'tg-server-search';
			inp.type = 'text';
			inp.value = f[2];
			inp.placeholder = f[3];
			inp.dataset.field = f[1];
			row.appendChild(inp);
			body.appendChild(row);
		});

		var hint = el('div', 'inet-hint');
		hint.style.marginTop = '14px';
		hint.innerHTML = SVG.info.replace('<svg ', '<svg style="width:14px;height:14px;fill:var(--simple-muted);flex-shrink:0" ');
		hint.appendChild(el('span', '', 'Ensure modem packages are installed from System \u203A Software. The connection will appear on this page once saved.'));
		body.appendChild(hint);

		var btns = el('div', 'inet-edit-actions');
		btns.style.marginTop = '16px';
		var cancelBtn = el('button', 'inet-cancel-btn', 'Cancel');
		cancelBtn.addEventListener('click', function() { overlay.remove(); });
		var saveBtn = el('button', 'tg-power-btn', 'Save Connection');
		saveBtn.style.cssText = 'width:auto;padding:10px 24px';
		saveBtn.addEventListener('click', function() {
			var dev = body.querySelector('[data-field="device"]').value.trim();
			var apn = body.querySelector('[data-field="apn"]').value.trim();
			var pin = body.querySelector('[data-field="pincode"]').value.trim();
			if (!dev) { self.showToast('Modem device path is required'); return; }
			if (!apn) { self.showToast('APN is required'); return; }

			var esc = function(s) { return s.replace(/'/g, "'\\''"); };
			var cmd = "uci set network.wwan=interface; " +
				"uci set network.wwan.proto='" + selectedProto + "'; " +
				"uci set network.wwan.device='" + esc(dev) + "'; " +
				"uci set network.wwan.apn='" + esc(apn) + "'; ";
			if (pin) cmd += "uci set network.wwan.pincode='" + esc(pin) + "'; ";
			cmd += "uci commit network; /etc/init.d/network reload; echo CELL_OK";

			L.resolveDefault(rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] })('/bin/sh', ['-c', cmd]), {}).then(function(res) {
				var out = (res && res.stdout) || '';
				if (out.indexOf('CELL_OK') !== -1) {
					overlay.remove();
					self.showToast('Cellular connection saved');
					setTimeout(function() { window.location.reload(); }, 3000);
				} else {
					self.showToast('Error saving configuration');
				}
			});
		});
		btns.appendChild(cancelBtn);
		btns.appendChild(saveBtn);
		body.appendChild(btns);

		modal.appendChild(body);
		overlay.appendChild(modal);
		overlay.addEventListener('click', function(ev) { if (ev.target === overlay) overlay.remove(); });
		document.body.appendChild(overlay);
	},

	renderWlan: function(ifaces, networkUci, wirelessUci) {
		var radios = this.getRadios(wirelessUci);
		if (radios.length === 0) return [];

		var stas = this.getStaIfaces(wirelessUci);
		var cards = [];
		for (var i = 0; i < stas.length; i++) {
			cards.push(this.renderWlanCard(stas[i], ifaces, wirelessUci));
		}
		return cards;
	},

	disconnectWifi: function(staIface) {
		var self = this;
		var staName = staIface['.name'];
		uci.load('wireless').then(function() {
			uci.set('wireless', staName, 'disabled', '1');
			return uci.save();
		}).then(function() {
			return uci.apply();
		}).then(function() {
			self.showToast('Disconnected from "' + (staIface.ssid || 'network') + '"');
			setTimeout(function() { window.location.reload(); }, 3000);
		}).catch(function(e) {
			self.showToast('Error: ' + (e.message || e));
		});
	},

	connectToWifi: function(ssid, isSecure, encInfo, radioDevice) {
		var self = this;
		var pw = '';
		if (isSecure) {
			var pwInput = document.getElementById('wlan-connect-pw-' + radioDevice);
			pw = pwInput ? pwInput.value : '';
			if (!pw) {
				self.showToast('Please enter the Wi-Fi password');
				return;
			}
		}

		var enc = 'psk2';
		if (encInfo) {
			if (encInfo.wpa && encInfo.wpa.indexOf(3) !== -1) enc = 'sae-mixed';
			else if (encInfo.wpa && encInfo.wpa.indexOf(2) !== -1) enc = 'psk2';
			else if (encInfo.wpa && encInfo.wpa.indexOf(1) !== -1) enc = 'psk';
			else if (!encInfo.enabled) enc = 'none';
		}

		var esc = function(s) { return s.replace(/'/g, "'\\''"); };
		var keyArg = (isSecure && pw) ? "uci set wireless.$SID.key='" + esc(pw) + "'; " : '';
		var cmd = 'SID=$(uci show wireless 2>/dev/null | grep "\\.mode=.sta.$" | head -1 | cut -d. -f2 | cut -d. -f1); ' +
			'if [ -z "$SID" ]; then ' +
			'N=0; while uci -q get wireless.wifinet$N >/dev/null 2>&1; do N=$((N+1)); done; ' +
			'SID=wifinet$N; uci set wireless.$SID=wifi-iface; fi; ' +
			"uci set wireless.$SID.device='" + radioDevice + "'; " +
			"uci set wireless.$SID.mode='sta'; " +
			"uci set wireless.$SID.network='wwan'; " +
			"uci set wireless.$SID.ssid='" + esc(ssid) + "'; " +
			"uci set wireless.$SID.encryption='" + enc + "'; " +
			keyArg +
			"uci set wireless.$SID.disabled='0'; " +
			"uci -q get network.wwan >/dev/null 2>&1 || { uci set network.wwan=interface; uci set network.wwan.proto='dhcp'; }; " +
			'uci commit wireless; uci commit network; wifi reload; echo STA_OK';
		L.resolveDefault(rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] })('/bin/sh', ['-c', cmd]), {}).then(function(res) {
			var out = (res && res.stdout) || '';
			if (out.indexOf('STA_OK') !== -1) {
				self.showToast('Connecting to "' + ssid + '"...');
				setTimeout(function() { window.location.reload(); }, 4000);
			} else {
				self.showToast('Error connecting to network');
			}
		});
	},

	render: function(data) {
		var ifaces = data[0] || [];
		var networkUci = data[1] || {};
		var wirelessUci = data[2] || {};

		var devStats = {};
		var dsOut = (data[3] && data[3].stdout) || '';
		dsOut.split('\n').forEach(function(line) {
			var p = line.trim().split(/\s+/);
			if (p.length >= 3)
				devStats[p[0]] = { rx: parseInt(p[1]) || 0, tx: parseInt(p[2]) || 0 };
		});

		var root = el('div', 'simple-page');
		var cssLink = el('link');
		cssLink.rel = 'stylesheet';
		cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var wanUci = null;
		for (var s in networkUci) {
			var sec = networkUci[s];
			if (sec && sec['.type'] === 'interface' && (sec['.name'] === 'wan' || s === 'wan')) {
				wanUci = sec;
				break;
			}
		}
		var wan = this.findIface(ifaces, 'wan');

		// Find the active internet interface (wan, wwan, or any up non-LAN iface)
		var skipIfaces = { loopback: 1, lan: 1, docker: 1, wg: 1, TorGuard: 1 };
		var activeInet = null;
		var activeLabel = '';

		if (wan && wan.up) {
			activeInet = wan;
			activeLabel = 'Ethernet';
		}
		if (!activeInet) {
			var wwan = this.findIface(ifaces, 'wwan');
			if (wwan && wwan.up) {
				activeInet = wwan;
				activeLabel = 'Wi-Fi Repeater';
			}
		}
		if (!activeInet) {
			for (var i = 0; i < ifaces.length; i++) {
				var ifc = ifaces[i];
				if (!ifc.up || skipIfaces[ifc['interface']]) continue;
				if (ifc['ipv4-address'] && ifc['ipv4-address'].length && ifc.route) {
					for (var r = 0; r < ifc.route.length; r++) {
						if (ifc.route[r].target === '0.0.0.0' && ifc.route[r].mask === 0) {
							activeInet = ifc;
							activeLabel = ifc['interface'].toUpperCase();
							break;
						}
					}
				}
				if (activeInet) break;
			}
		}

		var isOnline = !!activeInet;
		var inetIP = '';
		if (activeInet && activeInet['ipv4-address'] && activeInet['ipv4-address'].length)
			inetIP = activeInet['ipv4-address'][0].address;
		var inetProto = activeInet ? (activeInet.proto || 'dhcp') : 'dhcp';
		var inetIface = activeInet ? (activeInet.l3_device || activeInet.device || '') : '';

		/* -- Hero -- */
		var hero = el('div', 'tg-hero');
		if (isOnline)
			hero.style.background = 'linear-gradient(135deg, #064e3b 0%, #047857 50%, #10b981 100%)';
		else
			hero.style.background = 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)';

		var iconDiv = el('div', 'tg-shield ' + (isOnline ? 'connected' : 'disconnected'),
			SVG.globe.replace('<svg ', '<svg style="width:40px;height:40px;fill:#fff" '));
		if (isOnline) {
			iconDiv.style.background = 'rgba(16,185,129,0.3)';
			iconDiv.style.boxShadow = '0 0 24px rgba(16,185,129,0.4), 0 0 48px rgba(16,185,129,0.2)';
		}
		hero.appendChild(iconDiv);

		hero.appendChild(el('div', 'tg-status-text', isOnline ? 'Online' : 'Offline'));

		var subParts = [];
		if (isOnline) {
			subParts.push((window.t||function(k){return k;})(activeLabel));
			if (inetIP) subParts.push(inetIP);
			if (activeInet && activeInet.uptime) subParts.push((window.t||function(k,n){return k.replace('%s',n);})('Up %s', formatUptime(activeInet.uptime)));
		} else {
			subParts.push((window.t||function(k){return k;})('No active internet connection'));
		}
		hero.appendChild(el('div', 'tg-status-sub', subParts.join('  \u2022  ')));

		if (isOnline && activeInet) {
			var rxB = 0, txB = 0;
			if (activeInet.data && activeInet.data.rx_bytes) {
				rxB = activeInet.data.rx_bytes;
				txB = activeInet.data.tx_bytes || 0;
			} else {
				var devName = activeInet.l3_device || activeInet.device || '';
				if (devStats[devName]) {
					rxB = devStats[devName].rx;
					txB = devStats[devName].tx;
				}
			}
			var stats = el('div', 'tg-stats');
			var dlStat = el('div', 'tg-stat');
			dlStat.appendChild(el('div', 'tg-stat-val', formatBytes(rxB)));
			dlStat.appendChild(el('div', 'tg-stat-label', '\u2193 Downloaded'));
			stats.appendChild(dlStat);
			var ulStat = el('div', 'tg-stat');
			ulStat.appendChild(el('div', 'tg-stat-val', formatBytes(txB)));
			ulStat.appendChild(el('div', 'tg-stat-label', '\u2191 Uploaded'));
			stats.appendChild(ulStat);
			hero.appendChild(stats);
		}

		root.appendChild(hero);

		root.appendChild(this.renderEthernet(wan, wanUci, ifaces));

		var tetheringSection = this.renderTethering(ifaces, networkUci);
		if (tetheringSection) root.appendChild(tetheringSection);

		var cellularSection = this.renderCellular(ifaces, networkUci);
		if (cellularSection) root.appendChild(cellularSection);

		var wlanCards = this.renderWlan(ifaces, networkUci, wirelessUci);
		for (var i = 0; i < wlanCards.length; i++) {
			root.appendChild(wlanCards[i]);
		}

		var addConn = this.renderAddConnection(wirelessUci, networkUci);
		if (addConn) {
			addConn.classList.add('inet-add-connection');
			root.appendChild(addConn);
		}

		return root;
	},

	handleSaveApply: null,
	handleSave: null,
	handleReset: null
});
