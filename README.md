# Tetrad

A worksheet for working through Marshall McLuhan's Tetrad of Media Effects — a framework for analyzing how any medium or technology enhances, obsolesces, retrieves, and reverses. You name a technology and fill in the four effects yourself, with your notes flowing into the diagram, where the text in each quadrant can be scrolled if it runs long.

## Install

Prerequisites:

- Ruby 2.7.0 or newer
- Bundler (`gem install bundler`)

```bash
git clone https://github.com/steimo/tetrad
cd tetrad
bundle install
bundle exec jekyll serve --livereload --baseurl ""
```

Open **http://localhost:4000**.

> The `--baseurl ""` flag serves the site at the root for local development.
> In production it's hosted under `/tetrad` (see `_config.yml`), so without
> the flag the dev server would only respond at `http://localhost:4000/tetrad/`.

## Contributing

Pull requests are welcome. Open an issue first for significant changes.

## Rights

The Tetrad of Media Effects is the intellectual legacy of [Marshall McLuhan](https://en.wikipedia.org/wiki/Marshall_McLuhan). Any associated rights belong to their respective holders, including [Andrew McLuhan](https://themcluhaninstitute.com/).
