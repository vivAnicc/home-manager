set -l session $(bw unlock 'Goldrake001!' --raw)
set -l items $(bw list --session $session items)
set -l data $(string split ' ' $(echo $items | jp '
    {
        "item_values" : [].fields[0].value,
        "ids": [].id
    }'\
))

set -l item_values_bad $(echo $data | jp 'item_values')
set -l ids_bad $(echo $data | jp 'ids')

set -l item_values_untrimmed $(string split '\n' $item_values_bad)
set -l ids_untrimmed $(string split '\n' $ids_bad)

for item_value_untrimmed in $item_values_untrimmed
    set -l item_value $(string trim -c ' ,"[]' $item_value_untrimmed)
    set item_values $item_values $item_value
end

set item_values $item_values[2..-2]
# echo $item_values[-1]

for id_untrimmed in $ids_untrimmed
    set -l id $(string trim -c ' ,"[]' $id_untrimmed)
    set ids $ids $id
end

set -l ids $ids[2..-2]
# echo $ids[-1]

for id in $ids
    set -l item_value $item_values[1]
    set item_values $item_values[2..-1]
    set both $both $(echo $id $item_value)
end

set -l chosen $(string split '|||' $(string join '|||' $both) | fzf --with-nth 2..)
# echo $chosen

set -l id $(string split ' ' $chosen)[1]
set -l id $(string trim $id)
# echo $id

hyprctl dispatch focuscurrentorlast

set -l item $(bw get --session $session item $id)

set -l username $(string trim -c ' "' $(echo $item | jp 'login.username'))
# set -l password $(string trim -c ' "' $(echo $item | jp 'login.password'))

echo -n $username | wl-copy
ydotool key 29:1 47:1 47:0 29:0

# ydotool key 15:1 15:0

# echo -n $password | wl-copy
# ydotool key 29:1 47:1 47:0 29:0

echo '' | wl-copy
