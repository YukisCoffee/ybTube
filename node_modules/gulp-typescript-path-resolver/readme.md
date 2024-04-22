# gulp-typescript-path-resolver
This is a simple module to replace the typescript path with original path

### example
```javascript
const gulp = require('gulp');
const ts = require('gulp-typescript');
const ts_import = require('gulp-typescript-path-resolver');

const tsProject = ts.createProject('./tsconfig.json');

gulp.task('build', () => {
    return tsProject.src()
        .pipe(tsProject())
        .pipe(ts_import.tsPathResolver(tsProjectSource.config.compilerOptions, {
            // You can Overwrite the path
            "paths": {
                "@app/env": [
                    "environments/environment"
                ]
            }
        }))
        .pipe(gulp.dest(tsProject.config.compilerOptions.outDir))
});

```

### your `tsconfig.json`

```json

{
  "compilerOptions": {
  "outDir": "./dest"
  , "rootDir": "./src"
  , "noImplicitAny": false
  , "baseUrl": "./src"
  , "module": "commonjs"
  , "paths": {
      "@app/env": [
        "environments/environment"
      ]
      , "@modules/*": [
        "modules/*"
      ]
      , "@util/*": [
        "modules/util/*"
      ]
    }
  }
}

```

Note: Don't forget to add `rootDir` option