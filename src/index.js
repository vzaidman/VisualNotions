const express = require('express');
const HandlebarsExpress = require('express-handlebars');
const fs = require('fs');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

const app = express();
const port = 3000;

if (isDev) {
  const livereload = require("livereload");
  const liveReloadServer = livereload.createServer({
    extraExts: ['hbs']
  });
  liveReloadServer.watch(__dirname);
} else {
  app.enable('view cache');
}

app.set('view engine', 'hbs');
app.engine('hbs', HandlebarsExpress.engine({
  layoutsDir: __dirname + '/layouts',
  defaultLayout: 'main',
  viewsDir: __dirname + '/views',
  extname: 'hbs',
  helpers: {
    'livereload-if-needed': function(){
      if (!isDev) {
        return '';
      }

      return `<script>document.write('<script src="http://'+(location.host || 'localhost').split(':')[0]+':35729/livereload.js?snipver=1"></' +'script>')</script>`
    },
    imp: function(ext, config){
      const filePath = path.normalize(`${__dirname}/views/${config.data.root.route}/${config.data.root.pageSlag}.${ext}`);
      if(!fs.existsSync(filePath)) {
        return '';
      }
      return fs.readFileSync(filePath);
    },
  }
}));

app.use(express.static('public'));
  
/*
  [
    {
      name: 'Applied Philosophy',
      slag: 'applied_philosophy',
      pages: [
        {
          name: 'Baruch Spinoza',
          slag: 'baruch_spinoza',
        },
        {
          name: 'Friedrich Nietzsche',
          slag: 'friedrich_nietzsche'
        }
      ]
    },
    ...
  ]
*/
const routes = [];

const convertFolderNameToName = f => f
  .split('_')
  .map(p => p[0].toUpperCase() + p.slice(1))
  .join(' ');

fs.readdirSync('./views').forEach(sectionFolderName => {
    if (sectionFolderName.endsWith('.hbs')) {
        return;
    }

    const section = {
      name: convertFolderNameToName(sectionFolderName),
      slag: sectionFolderName,
      pages: [],
    };

    fs.readdirSync(`./views/${sectionFolderName}`).forEach(pageFolderName => {
        section.pages.push({
          name: convertFolderNameToName(pageFolderName),
          slag: pageFolderName,
        });
    });

    routes.push(section);
});

const getRenderProps = ({routes, route, pageName, pageSlag}) => {
  return {
    routes,
    route,
    pageTitle: `${pageName} | VisualNotions.com`,
    pageSlag,
  }
};

routes.forEach(section => {
    section.pages.forEach(page => {
      const route = `${section.slag}/${page.slag}`;
      app.get(`/${route}`, (req, res) => {
            res.render(path.normalize(`${route}/${page.slag}.hbs`), getRenderProps({
              routes,
              route,
              pageName: page.name,
              pageSlag: page.slag,
            }));
        });        
    })
})

app.get('/', (req, res) => {
    res.render('home.hbs', {
      routes,
      route: '/',
      pageName: 'Home',
      pageSlag: 'home',
    });
}); 

app.listen(port, () => console.log(`App listening to port ${port}`));