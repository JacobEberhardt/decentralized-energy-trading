from setuptools import setup, find_packages

setup(
    name = 'importer',
    version = '0.1.0',
    python_requires = '>=3',
    packages = find_packages(
        exclude = ['docs','tests*']
    ),
    entry_points = {
        'console_scripts': [
            'importer = importer.discovergy:download'
        ]
    },
    author = 'Marco Peise',
    author_email = 'mp@ise.tu-berlin.de',
    license = 'MIT License'
)
