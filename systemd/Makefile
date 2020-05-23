
build: /opt/rp0-bankbox/dest

/opt/rp0-bankbox:
	sudo rm -Rf /opt/rp0-bankbox
	sudo mkdir -p /opt/rp0-bankbox
	sudo cp -a ../* /opt/rp0-bankbox
	sudo cp -a ../.node /opt/rp0-bankbox
	sudo chmod -R 777 /opt/rp0-bankbox
	sed "s/^export //g" /opt/rp0-bankbox/environment.vars >> /opt/rp0-bankbox/environment
	sed -i "s/\\\\//g" /opt/rp0-bankbox/environment
	rm -Rf /opt/rp0-bankbox/node_modules /opt/rp0-bankbox/dest

/opt/rp0-bankbox/node_modules: /opt/rp0-bankbox
	cd /opt/rp0-bankbox && npm ci

/opt/rp0-bankbox/dest: /opt/rp0-bankbox/node_modules
	cd /opt/rp0-bankbox && npm run build

clean:
	sudo rm -Rf /opt/rp0-bankbox

install: /opt/rp0-bankbox/dest
	sudo cp /opt/rp0-bankbox/systemd/*.service /etc/systemd/system/
	sudo systemctl daemon-reload
	sudo systemctl enable rp0-bankbox*
	echo "Run `sudo systemctl start rp0-bankbox` to start"
