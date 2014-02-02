from __future__ import print_function

import sys
from bs4 import BeautifulSoup

def main():
    branch_name = sys.argv[1]

    soup = BeautifulSoup(open('example/' + branch_name + '.html'))

    nice_name = ' '.join([x.capitalize() for x in branch_name.split('-')])

    soup.title.string = 'Tideline: ' + nice_name

    css_link = soup.find(href='../css/tideline.css')

    js_link = soup.find(src='bundle.js')

    css_link['href'] = branch_name + '.css'

    js_link['src'] = branch_name + '.js'

    with open('example/' + branch_name + '.html', 'w') as f:
        f.write(soup.prettify())

if __name__ == '__main__':
    main()