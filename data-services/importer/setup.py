from setuptools import setup, find_packages

setup(
    name = 'dayimporter',
    version = '0.1.0',
    python_requires = '>=3',
    packages = find_packages(
        exclude = ['docs','tests*']
    ),
    entry_points = {
        'console_scripts': [
            'dayimporter = dayimporter.__main__:main'
        ]
    },
    author = 'Marco Peise',
    author_email = 'mp@ise.tu-berlin.de',
    license = 'MIT License'
)
