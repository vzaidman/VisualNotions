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
      name: 'philosophers',
      pages: [
        'nietzsche',
        'spinoza',
      ]
    },
    ...
  ]
*/
const routes = [];

fs.readdirSync('./views').forEach(sectionName => {
    if (sectionName.includes('.hbs')) {
        return;
    }

    const section = {name: sectionName, pages: []};
    routes.push(section);

    fs.readdirSync(`./views/${sectionName}`).forEach(pageFileName => {
        const pageName = pageFileName.replace('.hbs', '');
        section.pages.push(pageName);
    });
});

routes.forEach(section => {
    section.pages.forEach(pageName => {
        app.get(`/${section.name}/${pageName}/`, (req, res) => {
            res.render(`${section.name}/${pageName}.hbs`, {routes});
        });        
    })
})

app.get('/', (req, res) => {
    res.render('home.hbs', {routes});
}); 

app.listen(port, () => console.log(`App listening to port ${port}`));