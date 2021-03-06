#!/bin/bash
#
# Guide: https://google.github.io/styleguide/shell.xml
# Link: https://github.com/jsdoc3/jsdoc
# Link: https://code.google.com/p/jsdoc-toolkit/wiki/CommandlineOptions

readonly CWD=$(cd $(dirname $0); pwd)
readonly LIB="${CWD}/lib"
readonly SRC="${CWD}/../src"
readonly DOCS="${CWD}/../docs"

readonly JSDOC_BIN="${LIB}/node_modules/jsdoc/jsdoc.js"
readonly JSDOC_CSS="${LIB}/node_modules/jsdoc/templates/default/static/styles/jsdoc-default.css"
readonly JSDOC_CFG="${CWD}/jsdoc.json"
readonly JSDOC_LOGO=".page-title {
  background: url(https://datamart.github.io/Glize/images/glize-logo.png) no-repeat left center/48px;
  padding-left: 55px;
}"


#
# Downloads jsdoc
#
function download() {
  local NPM="${LIB}/npm"
  if [[ ! -f "${NPM}" ]]; then
    NPM="$(which npm)"
  fi

  if [[ ! -f "${JSDOC_BIN}" ]]; then
    echo "Installing jsdoc:"
    mkdir -p "${LIB}"
    cd "${LIB}"
    if [[ ! -f "${NPM}" ]]; then
      echo "Installing npm:"
      if [[ `uname` == "Darwin" ]]; then
        brew install npm
      fi
    fi

    if [[ -f "${NPM}" ]]; then
      $NPM install jsdoc bluebird
      echo ${JSDOC_LOGO} >> ${JSDOC_CSS}
    fi

    cd "${CWD}"
    echo "Done"
  fi
}

#
# Runs jsdoc.
#
function run() {
  echo -n "Running jsdoc: "
  if [[ -f "${JSDOC_BIN}" ]]; then
    rm -rf ${DOCS} && mkdir ${DOCS}
    ${JSDOC_BIN} ${SRC} -r -c ${JSDOC_CFG} -d ${DOCS}
  fi
  echo "Done"
}

#
# The main function.
#
function main() {
  download
  run
}

main "$@"
