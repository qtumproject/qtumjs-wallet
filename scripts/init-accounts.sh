while
     qcli help &> /dev/null
     rc=$?; if [[ $rc == 0 ]]; then break; fi
do :;  done

balance=`qcli getbalance`
if [ "${balance:0:1}" == "0" ]
then
    set -x
	qcli generate 600 > /dev/null
	set -
fi

LOCKFILE=${QTUM_DATADIR}/import-test-wallet.lock

if [ ! -e $LOCKFILE ]; then
  while
       qcli getaddressesbyaccount "" &> /dev/null
       rc=$?; if [[ $rc != 0 ]]; then continue; fi

       set -x

       qcli importprivkey "cMbgxCJrTYUqgcmiC1berh5DFrtY1KeU4PXZ6NZxgenniF1mXCRk" # addr=qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW hdkeypath=m/88'/0'/1'
       qcli importprivkey "cRcG1jizfBzHxfwu68aMjhy78CpnzD9gJYZ5ggDbzfYD3EQfGUDZ" # addr=qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf hdkeypath=m/88'/0'/2'

       solar prefund qUbxboqjBRp96j3La8D1RYkyqx5uQbJPoW 500
       solar prefund qLn9vqbr2Gx3TsVR9QyTVB5mrMoh4x43Uf 500
       touch $LOCKFILE

       set -
       break
  do :;  done
fi
