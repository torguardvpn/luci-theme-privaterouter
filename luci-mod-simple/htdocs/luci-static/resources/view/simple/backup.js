'use strict';
'require view';
'require rpc';

var callFileExec = rpc.declare({ object: 'file', method: 'exec', params: ['command', 'params'] });
var callSystemBoard = rpc.declare({ object: 'system', method: 'board', expect: {} });

var SVG = {
	backup: '<svg viewBox="0 0 24 24"><path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/></svg>',
	download: '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>',
	upload: '<svg viewBox="0 0 24 24"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>',
	reset: '<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>',
	warning: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>'
};

function el(tag, cls, children) {
	var e = document.createElement(tag);
	if (cls) e.className = cls;
	if (typeof children === 'string') e.innerHTML = children;
	else if (children instanceof Node) e.appendChild(children);
	return e;
}

function ic(svg, size, color) {
	return svg.replace('<svg ', '<svg style="width:' + (size || 14) + 'px;height:' + (size || 14) + 'px;fill:' + (color || 'currentColor') + '" ');
}

return view.extend({
	load: function() {
		return Promise.all([
			callSystemBoard(),
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'ls /etc/config/ 2>/dev/null | wc -l; echo "---"; ' +
				'cat /etc/openwrt_release 2>/dev/null | grep DISTRIB_DESCRIPTION | cut -d= -f2 | tr -d "\'"'
			]), {})
		]);
	},

	handleSaveApply: null, handleSave: null, handleReset: null,

	showToast: function(msg) {
		var old = document.querySelector('.simple-toast');
		if (old) old.remove();
		var t = E('div', { 'class': 'simple-toast' }, msg);
		document.body.appendChild(t);
		setTimeout(function() { t.remove(); }, 3000);
	},

	render: function(data) {
		var self = this;
		var board = data[0] || {};
		var infoOut = (data[1] && data[1].stdout) || '';
		var parts = infoOut.split('---');
		var configCount = (parts[0] || '').trim() || '0';
		var release = board.release || {};

		var root = el('div', 'simple-page');
		var cssLink = el('link'); cssLink.rel = 'stylesheet'; cssLink.href = L.resource('view/simple/css/simple.css');
		root.appendChild(cssLink);

		var hero = el('div', 'tg-hero');
		hero.style.background = 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #3b82f6 100%)';
		var iconDiv = el('div', 'tg-shield connected');
		iconDiv.innerHTML = ic(SVG.backup, 40, '#fff');
		iconDiv.style.background = 'rgba(59,130,246,0.3)';
		iconDiv.style.boxShadow = '0 0 24px rgba(59,130,246,0.4)';
		hero.appendChild(iconDiv);
		hero.appendChild(el('div', 'tg-status-text', 'Backup & Restore'));
		hero.appendChild(el('div', 'tg-status-sub', (window.t||function(k,n){return k.replace('%s',n);})('%s config files', configCount) + ' \u2022 ' + (release.description || 'OpenWrt')));

		var stats = el('div', 'tg-stats');
		var s1 = el('div', 'tg-stat');
		s1.appendChild(el('div', 'tg-stat-val', board.hostname || 'OpenWrt'));
		s1.appendChild(el('div', 'tg-stat-label', 'Hostname'));
		stats.appendChild(s1);
		var s2 = el('div', 'tg-stat');
		s2.appendChild(el('div', 'tg-stat-val', release.revision || '-'));
		s2.appendChild(el('div', 'tg-stat-label', 'Revision'));
		stats.appendChild(s2);
		var s3 = el('div', 'tg-stat');
		s3.appendChild(el('div', 'tg-stat-val', board.model || '-'));
		s3.appendChild(el('div', 'tg-stat-label', 'Model'));
		stats.appendChild(s3);
		hero.appendChild(stats);
		root.appendChild(hero);

		/* Download Backup Card */
		var dlCard = el('div', 'tg-config stor-card');
		var dlHdr = el('div', 'stor-card-hdr');
		dlHdr.innerHTML = ic(SVG.download, 20, 'var(--simple-accent)');
		dlHdr.appendChild(el('span', 'stor-card-title', 'Download Backup'));
		dlCard.appendChild(dlHdr);

		var dlBody = el('div', 'sys-card-body');
		dlBody.style.padding = '16px 20px';
		dlBody.appendChild(el('p', '', 'Download a complete backup of your router configuration. This includes all settings, firewall rules, wireless config, and installed package lists.'));

		var dlActions = el('div', 'sys-card-actions');
		var dlBtn = el('button', 'fw-save-btn');
		dlBtn.innerHTML = ic(SVG.download, 16, '#fff') + ' Download Backup';
		dlBtn.addEventListener('click', function() {
			dlBtn.disabled = true;
			dlBtn.innerHTML = 'Generating backup\u2026';
			L.resolveDefault(callFileExec('/bin/sh', ['-c',
				'sysupgrade -b /tmp/backup-privaterouter.tar.gz 2>&1 && echo BACKUP_OK || echo BACKUP_FAIL'
			]), {}).then(function(res) {
				var out = (res && res.stdout) || '';
				if (out.indexOf('BACKUP_OK') !== -1) {
					var a = document.createElement('a');
					a.href = '/cgi-bin/cgi-download?path=/tmp/backup-privaterouter.tar.gz&filename=backup-privaterouter.tar.gz';
					a.download = 'backup-privaterouter.tar.gz';
					document.body.appendChild(a);
					a.click();
					a.remove();
					self.showToast('Backup download started');
				} else {
					self.showToast('Backup generation failed');
				}
				dlBtn.disabled = false;
				dlBtn.innerHTML = ic(SVG.download, 16, '#fff') + ' Download Backup';
			});
		});
		dlActions.appendChild(dlBtn);
		dlCard.appendChild(dlBody);
		dlCard.appendChild(dlActions);
		root.appendChild(dlCard);

		/* Restore Backup Card */
		var rsCard = el('div', 'tg-config stor-card');
		var rsHdr = el('div', 'stor-card-hdr');
		rsHdr.innerHTML = ic(SVG.upload, 20, 'var(--simple-accent)');
		rsHdr.appendChild(el('span', 'stor-card-title', 'Restore Backup'));
		rsCard.appendChild(rsHdr);

		var rsBody = el('div', 'sys-card-body');
		rsBody.style.padding = '16px 20px';
		rsBody.appendChild(el('p', '', 'Upload a previously downloaded backup file to restore your router configuration. The router will reboot after restoring.'));

		var fileRow = el('div', 'fw-form-row');
		fileRow.appendChild(el('label', 'fw-form-label', 'Backup File (.tar.gz)'));
		var fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.tar.gz,.gz,.tgz';
		fileInput.className = 'fw-form-input';
		fileInput.style.padding = '8px';
		fileRow.appendChild(fileInput);
		rsBody.appendChild(fileRow);

		var rsActions = el('div', 'sys-card-actions');
		var rsBtn = el('button', 'fw-save-btn');
		rsBtn.innerHTML = ic(SVG.upload, 16, '#fff') + ' Restore Backup';
		rsBtn.addEventListener('click', function() {
			if (!fileInput.files || !fileInput.files.length) {
				self.showToast('Please select a backup file');
				return;
			}
			if (!confirm('Restore this backup? The router will reboot and apply the saved configuration.')) return;

			rsBtn.disabled = true;
			rsBtn.innerHTML = 'Uploading\u2026';

			var file = fileInput.files[0];
			var formData = new FormData();
			formData.append('sessionid', L.env.sessionid || rpc.getSessionID());
			formData.append('filename', '/tmp/backup.tar.gz');
			formData.append('filedata', file);

			var xhr = new XMLHttpRequest();
			xhr.open('POST', L.env.cgi_base + '/cgi-upload', true);
			xhr.onload = function() {
				if (xhr.status === 200) {
					rsBtn.innerHTML = 'Restoring\u2026';
					L.resolveDefault(callFileExec('/bin/sh', ['-c',
						'sysupgrade -r /tmp/backup.tar.gz 2>&1; echo RESTORE_OK'
					]), {}).then(function() {
						self.showToast('Backup restored! Rebooting\u2026');
						rsBtn.innerHTML = 'Rebooting\u2026';
						L.resolveDefault(callFileExec('/bin/sh', ['-c', 'reboot']), {});
						setTimeout(function() {
							self.showToast('Router is rebooting. Please wait\u2026');
						}, 2000);
					});
				} else {
					self.showToast('Upload failed');
					rsBtn.disabled = false;
					rsBtn.innerHTML = ic(SVG.upload, 16, '#fff') + ' Restore Backup';
				}
			};
			xhr.onerror = function() {
				self.showToast('Upload error');
				rsBtn.disabled = false;
				rsBtn.innerHTML = ic(SVG.upload, 16, '#fff') + ' Restore Backup';
			};
			xhr.send(formData);
		});
		rsActions.appendChild(rsBtn);
		rsCard.appendChild(rsBody);
		rsCard.appendChild(rsActions);
		root.appendChild(rsCard);

		/* Reset to Defaults Card */
		var rstCard = el('div', 'tg-config stor-card');
		var rstHdr = el('div', 'stor-card-hdr');
		rstHdr.innerHTML = ic(SVG.warning, 20, '#ef4444');
		rstHdr.appendChild(el('span', 'stor-card-title', 'Reset to Factory Defaults'));
		rstCard.appendChild(rstHdr);

		var rstBody = el('div', 'sys-card-body');
		rstBody.style.padding = '16px 20px';
		var warnBox = el('div', '');
		warnBox.style.cssText = 'background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);border-radius:10px;padding:14px 16px;margin-bottom:12px;display:flex;align-items:flex-start;gap:10px';
		warnBox.innerHTML = ic(SVG.warning, 20, '#ef4444');
		warnBox.appendChild(el('span', '', 'This will erase <strong>all settings</strong> and restore the router to its original factory state. All configurations, passwords, and installed packages will be lost. This cannot be undone.'));
		rstBody.appendChild(warnBox);

		var rstActions = el('div', 'sys-card-actions');
		var rstBtn = el('button', 'fw-save-btn');
		rstBtn.style.background = '#ef4444';
		rstBtn.innerHTML = ic(SVG.reset, 16, '#fff') + ' Reset to Factory Defaults';
		rstBtn.addEventListener('click', function() {
			if (!confirm('WARNING: This will erase ALL settings and reboot the router.\n\nAre you absolutely sure?')) return;
			if (!confirm('Last chance! All data will be lost. Continue?')) return;
			rstBtn.disabled = true;
			rstBtn.innerHTML = 'Resetting\u2026';
			L.resolveDefault(callFileExec('/bin/sh', ['-c', 'firstboot -y && reboot']), {}).then(function() {
				self.showToast('Factory reset initiated. Router is rebooting\u2026');
			});
		});
		rstActions.appendChild(rstBtn);
		rstCard.appendChild(rstBody);
		rstCard.appendChild(rstActions);
		root.appendChild(rstCard);

		return root;
	}
});
