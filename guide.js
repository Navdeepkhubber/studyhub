/* Study Compass guide content: missions, skills, portfolio, DSA atlas. */

/* ---------- Weekly missions ---------- */
const missions=[
{steps:['Run a Python and pandas baseline exercise; note three weak areas in your weekly notes.','Use one dataset to make a data dictionary, missingness table and five exploratory plots.','Solve one SQL window question and inspect one Spark query plan.'],proof:'Notebook runs from the README; every field has a definition; your question and next analysis step are written.'},
{steps:['Work a small matrix multiplication and covariance example by hand.','Implement PCA with NumPy; compare components and explained variance with scikit-learn.','Review Parquet columnar storage and solve one SQL problem.'],proof:'Notebook explains centering, retained variance and when PCA would harm interpretation.'},
{steps:['Simulate conditional probability and Bayes rule on a small example.','Plot binomial, Poisson and normal samples; compare simulated and theoretical moments.','Diagnose one Spark join or shuffle with an execution plan.'],proof:'Plots have labels and a short interpretation of assumptions and uncertainty.'},
{steps:['Write a hypothesis, outcome metric, sample-size assumption and test plan.','Simulate an A/B test; calculate an interval, p-value and effect size.','Make one ingestion step safe to rerun without duplicate records.'],proof:'Notebook separates practical impact from statistical significance and lists bias risks.'},
{steps:['Fit a mean or majority baseline, a regularised regression and a tree model.','Compare held-out performance and inspect residuals or classification errors.','Sketch a star schema and explain the table grain.'],proof:'Report includes baseline, split method, metrics, assumptions and residual plots.'},
{steps:['Build a scikit-learn Pipeline for preprocessing and modelling.','Use cross-validation only on training data; keep one untouched test set.','Add a data-quality check and a short model card.'],proof:'One command reproduces training; model card lists intended use, metrics and limits.'},
{steps:['Compare regression or logistic regression with random forest and boosting.','Inspect error slices and feature importance without claiming causality.','Review one streaming concept and solve a SQL problem.'],proof:'Comparison table uses the same split and metric; explain where each model fails.'},
{steps:['Run clustering and PCA on a suitable dataset; check scaling and cluster stability.','Read one research paper and summarise question, method, evidence and limitations.','Record data lineage and privacy considerations for the project.'],proof:'Notebook explains why clusters are or are not useful; critique is one page.'},
{steps:['Implement a small PyTorch model with fixed seed and baseline.','Plot training and validation losses; change one hyperparameter at a time.','Review distributed loading or Parquet performance in your data pipeline.'],proof:'Reproducible training script, learning curves and a written failure analysis.'},
{steps:['Draw the data flow from source through quality checks to model input.','Build or refactor one batch step; test a rerun and measure runtime.','Explain a Spark join, shuffle or skew issue and one possible fix.'],proof:'Diagram, passing checks and before/after runtime are saved with the project.'},
{steps:['Create a seasonal-naive forecast before any complex model.','Use rolling-origin backtesting and measure MAE or RMSE.','Document late data and backfill handling for the pipeline.'],proof:'Forecast chart, backtest table and interval coverage or uncertainty note.'},
{steps:['Re-run one project from a clean environment.','Write README sections for question, data, methods, results, limits and reproduction.','List three specific gaps to address in weeks 13–20.'],proof:'A reviewer can reproduce results and understand the trade-offs without asking you.'},
{steps:['Derive PCA or SVD on a small matrix and complete one MIT exercise.','Set up R and complete vector/data-frame exercises.','Check the forecasting dataset and baseline; do one SQL/Spark upkeep problem.'],proof:'Saved derivation, working R script and documented forecast baseline.'},
{steps:['Work through probability or likelihood examples; run ISLP regression labs.','Use R to import, clean and summarise the forecast data.','Backtest the baseline and write what it cannot capture.'],proof:'Lab code runs; R summary matches Python checks; baseline backtest is recorded.'},
{steps:['Simulate power and minimum detectable effect for an A/B test.','Fit a quantile forecast and compare interval coverage with the baseline.','Complete one R functions exercise and one SQL upkeep question.'],proof:'Notebook states metric, design assumptions, power, coverage and decision.'},
{steps:['Compare regularised, tree and boosting models on one fixed backtest.','Use R to clean missing values and produce an EDA summary.','Keep the AI work small: evaluate an existing RAG answer set.'],proof:'Model comparison includes error slices, runtime and a justified choice.'},
{steps:['Train a small PyTorch model; log parameters, metrics and artifacts.','Use dplyr and tidyr to reproduce one Python transformation in R.','Do one SQL/Spark upkeep problem and note the result.'],proof:'Training can be rerun, metrics are saved, and R/Python outputs agree.'},
{steps:['Evaluate forecasting models across several time windows.','Check interval calibration and plot residuals by segment.','Make one clear ggplot2 graphic for a non-technical reader.'],proof:'Results section reports uncertainty, failure cases and a defensible recommendation.'},
{steps:['Read two papers or technical articles; write one-page summaries with limitations.','Draft the forecasting project README and plain-English results.','For the AI project, record a small eval set and failure categories.'],proof:'Two cited summaries, reproducible project draft and an AI evaluation table.'},
{steps:['Run final projects from clean instructions and fix broken steps.','Publish three concise project pages or READMEs with links and screenshots.','Record remaining prerequisite gaps and the first-semester study plan.'],proof:'Portfolio links work; each project shows question, method, result, limitations and your contribution.'}
];

/* ---------- Skill map lanes ---------- */
const skillLanes=[
{name:'Data engineering',description:'Keep your existing strength current and demonstrable.',skills:[
{id:'sql',name:'Advanced SQL',week:'1–12 + upkeep',evidence:'Queries with joins, CTEs, windows and explanation of trade-offs',learn:'https://www.postgresql.org/docs/current/tutorial.html',practice:'https://leetcode.com/studyplan/top-sql-50/'},
{id:'python-eng',name:'Production Python',week:'1–12',evidence:'Tested pipeline with README and rerun instructions',learn:'https://docs.python.org/3/tutorial/',practice:'https://exercism.org/tracks/python/exercises'},
{id:'spark',name:'Spark and data architecture',week:'2–12',evidence:'Measured job, execution plan and data-flow diagram',learn:'https://spark.apache.org/docs/latest/sql-programming-guide.html',practice:'https://github.com/DataTalksClub/data-engineering-zoomcamp'},
{id:'quality',name:'Data quality and orchestration',week:'4–12',evidence:'Idempotent ingestion, checks and reproducible schedule',learn:'https://docs.getdbt.com/docs/build/data-tests',practice:'https://learn.getdbt.com/'}]},
{name:'Data science',description:'Prioritise these for the Auckland statistics bridge and degree.',skills:[
{id:'stats',name:'Probability and inference',week:'1–4, 13–15',evidence:'Simulation and A/B analysis with assumptions and uncertainty',learn:'https://www.openintro.org/book/os/',practice:'https://seeing-theory.brown.edu/'},
{id:'ml',name:'Statistical learning',week:'5–8, 16–18',evidence:'Baseline-to-model comparison on an untouched test set',learn:'https://www.statlearning.com/',practice:'https://islp.readthedocs.io/en/latest/labs.html'},
{id:'evaluation',name:'Experiment and model evaluation',week:'4–7, 15–18',evidence:'Backtest, error slices, calibration and model card',learn:'https://scikit-learn.org/stable/model_selection.html',practice:'https://www.kaggle.com/learn/intermediate-machine-learning'},
{id:'r',name:'R and visualisation',week:'13–20',evidence:'R analysis and publication-ready ggplot with interpretation',learn:'https://r4ds.hadley.nz/',practice:'https://exercism.org/tracks/r/exercises/'}]},
{name:'AI engineering',description:'Build one credible system and evaluate it; avoid chasing every tool.',skills:[
{id:'dl',name:'Deep learning foundations',week:'9, 17',evidence:'Small PyTorch model with curves and baseline',learn:'https://pytorch.org/tutorials/',practice:'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html'},
{id:'rag',name:'Retrieval and LLM apps',week:'7–8, 16–20',evidence:'RAG demo with citations and a documented dataset',learn:'https://huggingface.co/learn/llm-course',practice:'https://huggingface.co/learn/agents-course'},
{id:'ai-eval',name:'AI evaluation and safety',week:'8, 16–20',evidence:'Held-out questions, failure labels and a before/after comparison',learn:'https://huggingface.co/learn/agents-course',practice:'https://docs.ragas.io/'},
{id:'mlops',name:'Serving and MLOps',week:'10–12, optional 23',evidence:'Versioned API or batch inference with tests and monitoring plan',learn:'https://mlflow.org/docs/latest/',practice:'https://fastapi.tiangolo.com/tutorial/'}]},
{name:'Computer science bridge',description:'Optional preparation for algorithms coursework or coding interviews.',skills:[
{id:'algorithms',name:'Algorithms and problem solving',week:'Optional',evidence:'Explained solutions with complexity notes for arrays, trees, graphs and dynamic programming',learn:'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/',practice:'https://bugaddr.github.io/a2z_old_sheet/'}]}
];

/* ---------- Portfolio projects ---------- */
const portfolioProjects=[
{id:'pipeline',name:'Reliable data-to-model pipeline',role:'Data engineer → ML engineer',weeks:'Build in weeks 4–12',brief:'Ingest a public dataset, test quality, model it for analytics, train a baseline and ship reproducible outputs.',criteria:['Clear data contract and dictionary','Idempotent ingestion with automated checks','SQL/Spark transformation and architecture diagram','Baseline model with held-out evaluation','README with runtime, trade-offs and limitations']},
{id:'forecast',name:'Statistical forecasting study',role:'Data scientist',weeks:'Build in weeks 11–20',brief:'Answer a real forecasting question with honest backtests and uncertainty, using Python and R where useful.',criteria:['Seasonal-naive baseline and time-aware backtest','At least two compared models','Error analysis and interval coverage','One R analysis or visualisation','Plain-English recommendation and limitations']},
{id:'rag',name:'Evaluated AI assistant',role:'AI engineer',weeks:'Build gradually in weeks 7–20',brief:'Create a small retrieval assistant over a bounded document set, then show when it succeeds and fails.',criteria:['Dataset and intended users documented','Retrieved sources shown with each answer','Held-out question set and evaluation rubric','Failure analysis, privacy and safety notes','Demo or API plus reproducible setup']}
];

/* ---------- DSA trackers + topic atlas ---------- */
const dsaTrackers=[
{name:'A2Z Old Sheet',url:'https://bugaddr.github.io/a2z_old_sheet/',desc:'Browse the full A2Z problem sequence and its available tutorial, video, article and coding links.'},
{name:'Traverses problems',url:'https://traverses.tech/problems',desc:'Discover more problems by topic and keep your practice organised.'}
];

