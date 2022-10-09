const express = require('express');
const handlebars = require('express-handlebars').engine;
const fs = require('fs');

const isDev = process.env.NODE_ENV === 'development';

if (isDev) {
  const livereload = require("livereload");
  const liveReloadServer = livereload.createServer({
    extraExts: ['hbs']
  });
  liveReloadServer.watch(__dirname);
}

const app = express();
const port = 3000;

app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/layouts',
    defaultLayout: 'main',
    viewsDir: __dirname + '/views',
    extname: 'hbs',
}));

app.use(express.static('public'));
  
/*
  [
    {
      name: 'Applied Philosophy',
      folderName: 'applied_philosophy',
      routeName: 'applied_philosophy',
      pages: [
        {
          name: 'Baruch Spinoza',
          fileName: 'baruch_spinoza.hbs',
          routeName: 'baruch_spinoza',
        },
        {
          name: 'Friedrich Nietzsche',
          fileName: 'friedrich_nietzsche.hbs'
          routeName: 'friedrich_nietzsche'
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
      folderName: sectionFolderName,
      routeName: sectionFolderName,
      pages: []
    };

    fs.readdirSync(`./views/${sectionFolderName}`).forEach(pageFolderName => {
        section.pages.push({
          fileName: `${pageFolderName}.hbs`,
          folderName: pageFolderName,
          routeName: pageFolderName,
          name: convertFolderNameToName(pageFolderName)
        });
    });

    routes.push(section);
});

routes.forEach(section => {
    section.pages.forEach(page => {
        app.get(`/${section.routeName}/${page.routeName}/`, (req, res) => {
            res.render(`${section.folderName}/${page.folderName}/${page.fileName}`, {routes, title: `${page.name} | VisualNotions.com`});
        });        
    })
})

app.get('/', (req, res) => {
    res.render('home.hbs', {routes, title: 'Home | VisualNotions.com'});
}); 

app.listen(port, () => console.log(`App listening to port ${port}`));