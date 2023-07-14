const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require('fs');
const port = process.env.PORT || 3000;

const app = express();


// Set up handlebars as the view engine
app.engine('hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', 'hbs');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'Home' });
  });

  app.post('/calculate', (req, res) => {
    const { height, weight, gender } = req.body;
    const bmi = calculateBMI(height, weight);
    const bmiData = { height, weight, bmi, gender };
  
    // Load existing BMI data from the JSON file
    let bmiHistory = loadBmiData();
  
    // Add new BMI data to the array
    bmiHistory.push(bmiData);
  
    // Save the updated BMI data to the JSON file
    saveBmiData(bmiHistory);
  
    res.redirect('/bmi');
  });
  
  app.get('/bmi', (req, res) => {
    const bmiHistory = loadBmiData();
  
    // Add status for each BMI value
    const bmiHistoryWithStatus = bmiHistory.map((data) => {
      const status = getStatus(data.bmi);
      return { ...data, status };
    });
  
    // Calculate the total number of entries
    const totalEntries = bmiHistory.length;
    const meanBMI = calculateMeanBMI(bmiHistory);

    res.render('bmi', { bmiHistory: bmiHistoryWithStatus, totalEntries: totalEntries, meanBMI });
  });
  
  // Start the server
  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
  
  // Helper functions
  function calculateBMI(height, weight) {
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  
  function getStatus(bmi) {
    if (bmi < 18.5) {
      return '<span style="color: rgb(230, 230, 156);">Underweight</span>';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
      return '<span style="color: rgb(159, 221, 159);">Healthy</span>';
    } else {
      return '<span style="color: rgb(236, 157, 157);">Overweight</span>';
    }
  }  
  
  function loadBmiData() {
    try {
      const data = fs.readFileSync('bmi-data.json', 'utf8');
      return JSON.parse(data);
    } catch (err) {
      console.error('Error reading BMI data:', err);
      return [];
    }
  }
  
  function saveBmiData(bmiData) {
    try {
      fs.writeFileSync('bmi-data.json', JSON.stringify(bmiData), 'utf8');
    } catch (err) {
      console.error('Error saving BMI data:', err);
    }
  }

  function calculateMeanBMI(bmiData) {
    const bmiSum = bmiData.reduce((sum, entry) => sum + parseFloat(entry.bmi), 0);
    const mean = bmiSum / bmiData.length;
    return mean.toFixed(2);
  }

  function saveBmiData(bmiData) {
    try {
      const jsonData = JSON.stringify(bmiData, null, 2)
        .replace(/\\n/g, '')
        .replace(/},{/g, '},\n{');
      fs.writeFileSync('bmi-data.json', jsonData, 'utf8');
    } catch (err) {
      console.error('Error saving BMI data:', err);
    }
  }
