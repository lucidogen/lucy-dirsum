'use strict'

require ( 'chai' )
.should ()

const fs = require ( 'fs' )
const dirsum = require ( '../index' )

const IGNORE_FUNCTION = function ( path, filename )
{ return /^\./.exec ( filename )
      || /^checksum\.txt/.exec ( path )
}

const base = __dirname + '/fixtures/'
const FILE_CONTENTS =
{ 'foo.txt': 'Foo.'
, 'bar.txt': 'Bar.'
, 'sub/baz.txt': 'Baz baz.'
}
const DIRHEX = '3d7c284e8ebb554c1e5961340604b90c'

const statPath = function(path) {
  try {
    return fs.statSync(path)
  } catch (e) {}
  return false
}        

describe
('dirsum'
, function ()
  { 
    beforeEach
    ( function ()
      { if ( statPath ( base ) )
        { for ( let key in FILE_CONTENTS )
          { fs.writeFileSync
            ( base + key
            , FILE_CONTENTS [ key ]
            )
          }
          if ( statPath ( base + 'checksum.txt' ) )
          { fs.unlinkSync ( base + 'checksum.txt' )
          }
          if ( statPath ( base + 'sub/.foo' ) )
          { fs.unlinkSync ( base + 'sub/.foo')
          }
          if ( !statPath ( base + 'empty' ) )
          { fs.mkdirSync ( base + 'empty' )
          }
        }
      }
    )          
    
    it
    ( 'should produce a digest'
    , function ( done )
      { dirsum
        ( base
        , function ( err, hex )
          { if ( err ) console.log ( err )
            hex.should.equal ( DIRHEX )
            done ()
          }
        )
      }
    )

    it
    ( 'should change digest on file change'
    , function ( done )
      { 
        fs.writeFileSync ( base + 'foo.txt', 'Fool.' )
        dirsum
        ( base
        , function ( err, hex )
          { hex.should.not.equal ( DIRHEX )
            fs.writeFileSync ( base + 'foo.txt', FILE_CONTENTS [ 'foo.txt' ] )
            dirsum
            ( base
            , function ( err, hex )
              { hex.should.equal ( DIRHEX )
                done ()
              }
            )
          }
        )
      }
    )

    it
    ( 'should change digest on new file'
    , function ( done )
      { 
        fs.writeFileSync ( base + 'other.txt', 'Fool.' )
        dirsum
        ( base
        , function ( err, hex )
          { hex.should.not.equal ( DIRHEX )
            fs.unlinkSync ( base + 'other.txt' )
            dirsum
            ( base
            , function ( err, hex )
              { hex.should.equal ( DIRHEX )
                done ()
              }
            )
          }
        )
      }
    )

    it
    ( 'should change digest on new directory'
    , function ( done )
      { fs.mkdirSync ( base + 'other')
        dirsum
        ( base
        , function ( err, hex )
          { hex.should.not.equal ( DIRHEX )
            fs.rmdirSync ( base + 'other' )
            dirsum
            ( base
            , function ( err, hex )
              { hex.should.equal ( DIRHEX )
                done ()
              }
            )
          }
        )
      }
    )

    it
    ( 'should change digest on file move'
    , function ( done )
      { fs.renameSync ( base + 'foo.txt', base + 'fol.txt')
        dirsum
        ( base
        , function ( err, hex )
          { hex.should.not.equal ( DIRHEX )
            fs.renameSync ( base + 'fol.txt', base + 'foo.txt')
            dirsum
            ( base
            , function ( err, hex )
              { hex.should.equal ( DIRHEX )
                done ()
              }
            )
          }
        )
      }
    )

    describe
    ( 'moving main folder'
    , function ()
      { let newname = __dirname + '/fifi/'
        before
        ( function ()
          { fs.renameSync ( base, newname )
          }
        )
        after
        ( function ()
          { fs.renameSync ( newname, base )
          }
        )
        it
        ( 'should not change digest'
        , function ( done )
          { dirsum
            ( newname
            , function ( err, hex )
              { hex.should.equal ( DIRHEX )
                done ()
              }
            )
          }
        )
      }
    )

    describe
    ( 'with ignore function'
    , function ()
      { it
        ( 'should ignore checksum.txt'
        , function ( done )
          { fs.writeFileSync ( base + 'checksum.txt', Math.random () )
            dirsum
            ( base
            , function ( err, hex )
              { hex.should.equal ( DIRHEX )
                fs.unlinkSync ( base + 'checksum.txt')
                done ()
              }
            , IGNORE_FUNCTION
            )
          }
        )

        it
        ( 'should not ignore checksum.txt in sub folders'
        , function ( done )
          { fs.writeFileSync ( base + 'sub/checksum.txt', Math.random () )
            dirsum
            ( base
            , function ( err, hex )
              { hex.should.not.equal ( DIRHEX )
                fs.unlinkSync ( base + 'sub/checksum.txt')
                done ()
              }
            , IGNORE_FUNCTION
            )
          }
        )
      }
    )

    describe
    ( 'with dot files'
    , function ()
      { before
        ( function ()
          { fs.writeFileSync ( base + 'sub/.foo', Math.random () )
          }
        )

        it
        ( 'should ignore dot files'
        , function ( done )
          { 
            dirsum
            ( base
            , function ( err, hex )
              { hex.should.equal ( DIRHEX )
                done ()
              }
            )
          }
        )
      }
    )
  }
)


