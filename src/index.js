const express = require('express');
const handlebars = require('express-handlebars').engine;
const fs = require('fs');

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

const convertFSToName = f => f
  .replace('.hbs', '')
  .split('_')
  .map(p => p[0].toUpperCase() + p.slice(1))
  .join(' ');

fs.readdirSync('./views').forEach(sectionFolderName => {
    if (sectionFolderName.endsWith('.hbs')) {
        return;
    }

    const section = {
      name: convertFSToName(sectionFolderName),
      folderName: sectionFolderName,
      routeName: sectionFolderName,
      pages: []
    };

    fs.readdirSync(`./views/${sectionFolderName}`).forEach(pageFileName => {
        section.pages.push({
          fileName: pageFileName,
          routeName: pageFileName.replace('.hbs', ''),
          name: convertFSToName(pageFileName)
        });
    });

    routes.push(section);
});

routes.forEach(section => {
    section.pages.forEach(page => {
        app.get(`/${section.routeName}/${page.routeName}/`, (req, res) => {
            res.render(`${section.folderName}/${page.fileName}`, {routes, title: `${page.name} | VisualNotions.com`});
        });        
    })
})

app.get('/', (req, res) => {
    res.render('home.hbs', {routes, title: 'Home | VisualNotions.com'});
}); 

app.listen(port, () => console.log(`App listening to port ${port}`));