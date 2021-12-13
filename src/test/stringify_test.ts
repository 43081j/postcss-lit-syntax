import {assert} from 'chai';
import {createTestAst} from './util.js';
import syntax = require('../main.js');

describe('stringify', () => {
  it('should stringify basic CSS', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { color: hotpink; }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should stringify single-line expressions', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { $\{expr}color: hotpink; }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should stringify multi-line expressions', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { $\{
          expr
        }color: hotpink; }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should stringify multiple expressions', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { $\{expr}color: hotpink; }
        .bar { $\{expr2}color: lime; }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should stringify multiple same-named expressions', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { $\{expr}color: hotpink; }
        .bar { $\{expr}color: lime; }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should stringify multiple multi-line expressions', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { $\{
          expr }$\{
          expr2
        }color: hotpink; }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should stringify multiple stylesheets', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { color: hotpink; }
      \`;

      const somethingInTheMiddle = 808;

      css\`.foo { color: lime; }\`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should handle deleted (by another plugin) expression state', () => {
    const {ast} = createTestAst(`
      css\`
        .foo { $\{expr}color: hotpink; }
      \`;
    `);

    const root = ast.nodes[0]!;
    root.raws['litTemplateExpressions'] = undefined;
    const output = ast.toString(syntax);

    assert.equal(
      output,
      `
      css\`
        .foo { /*POSTCSS_LIT:0*/color: hotpink; }
      \`;
    `
    );
  });

  it('should ignore non-placeholder comments', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo { /*BOOP*/color: hotpink; }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should handle deleted individual expression state', () => {
    const {ast} = createTestAst(`
      css\`
        .foo { $\{expr}color: hotpink; }
      \`;
    `);

    const root = ast.nodes[0]!;
    root.raws['litTemplateExpressions'] = [];
    const output = ast.toString(syntax);

    assert.equal(
      output,
      `
      css\`
        .foo { /*POSTCSS_LIT:0*/color: hotpink; }
      \`;
    `
    );
  });

  it('should handle base indentations', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo {
          color: hotpink;
        }

        .bar {
          border: 808em solid cyan;
        }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should deal with multi-line rules', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo,
          .bar {
            color: hotpink;
        }

        .x,
        .x > .y {
  font-size: 32em;
        }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should deal with multi-line declarations', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo {
          margin:
            1px
            2px
            3px
            4px;
        }

        .bar {
          margin: 1px
            2px
            3px;
        }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should deal with unusual between values', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo {
          margin
            :
              10px;
        }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should deal with unusual before values', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo {
          margin: 10px;

          ;

          margin: 20px;
        }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });

  it('should deal with unusual after values', () => {
    const {source, ast} = createTestAst(`
      css\`
        .foo {
          margin:
            1px
            2px;

          ;

        }
      \`;
    `);

    const output = ast.toString(syntax);

    assert.equal(output, source);
  });
});
