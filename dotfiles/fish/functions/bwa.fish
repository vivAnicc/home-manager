set -l session $(bw unlock 'Goldrake001!' --raw)

set -l name $(read -P 'name: ')
set -l username $(read -P 'username: ')
set -l password $(read -P 'password: ')

set -l json "
    {
        \"name\": \"$name\",
        \"type\": 1,
        \"fields\": [
            {
                \"name\": \"item_name\",
                \"value\": \"$name\",
                \"type\": 0,
                \"linkedId\": null
            }
        ],
        \"login\": {
            \"username\": \"$username\",
            \"password\": \"$password\"
        }
    }
"

set -l encoded $(echo -n $json | bw encode --session $session --raw)
bw create --session $session --quiet item $encoded
