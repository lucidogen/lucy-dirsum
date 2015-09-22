/*
  # checkdir

  Compute directory checksum.
*/
'use strict'
const crypto   = require ( 'crypto' )
const path     = require ( 'path'   )
const fs       = require ( 'fs'     )

const md5 = function ( self, apath, rpath, clbk, isdir )
{ self.hash.update ( rpath ) // add relative path to hash
                             // for empty directory and file rename
  if ( isdir )
  { fs.readdir
    ( apath
    , function ( err, filenames )
      { if ( err ) return clbk ( err )
        let i = 0, len = filenames.length
        let parse = function ( err )
        { if ( err ) return clbk ( err )
          if ( i >= len ) return clbk ()
          let f = filenames [ i++ ]
          let p = path.join ( apath, f )
          // ignore and compute relative path
          let rp = self.keep ( p, f )
          if ( ! rp )
          { parse ()
          }
          else
          { fs.stat
            ( p
            , function ( err, stats )
              { if ( err ) return clbk ( err )
                if ( stats.isDirectory () )
                { md5 ( self, p, rp, parse, true )
                }
                else
                { md5 ( self, p, rp, parse )
                }
              }
            )
          }
        }
        parse ()
      }
    )
  }
  else
  { let stream = fs.createReadStream ( apath )

    stream.on
    ( 'data'
    , function ( data )
      { self.hash.update ( data )
      }
    )

    stream.on
    ( 'end'
    , clbk
    )
  }
}

const IGNORE_DOT_FILES = /^\./

const DEFAULT_IGNORE_FUNCTION = function ( path, filename )
{ return IGNORE_DOT_FILES.exec ( filename )
}

module.exports = function ( apath, clbk, ignore )
{ apath = path.resolve ( apath )
  ignore = ignore || DEFAULT_IGNORE_FUNCTION
  let plen = apath.length + 1

  let keepFunc = function ( path, filename )
  { let p = path.substring ( plen )
    if ( ignore ( p, filename ) )
    { return false
    }
    else
    { return p
    }
  }
  
  let self =
  { hash: crypto.createHash ( 'md5' )
  , keep: keepFunc
  }
  fs.stat
  ( apath
  , function ( err, stats )
    { if ( err ) return clbk ( err )
      md5
      ( self
      , apath
      , '' // initial relative path
      , function ( err )
        { if ( err ) return clbk ( err )
          clbk ( null, self.hash.digest ( 'hex' ) )
        }
      , stats.isDirectory ()
      )
    }
  )
}

